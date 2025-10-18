import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse } from "../utils/response";
import { paginate, getPaginationParams } from "../utils/pagination";

export const getAllPOs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, category, role, search } = req.query;
    const { page, limit } = getPaginationParams(req.query);
    
    let pos = await storage.getAllPurchaseOrders();
    
    if (status) {
      pos = pos.filter(po => po.status === status);
    }
    if (category) {
      pos = pos.filter(po => po.category === category);
    }
    if (role) {
      pos = pos.filter(po => po.createdByRole === role);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      pos = pos.filter(po => 
        po.poNumber.toLowerCase().includes(searchLower) ||
        (po.notes && po.notes.toLowerCase().includes(searchLower))
      );
    }
    
    const posWithCounts = await Promise.all(
      pos.map(async (po) => {
        const items = await storage.getPOItemsByPOId(po.id);
        return {
          ...po,
          itemCount: items.length,
        };
      })
    );
    
    //const result = paginate(posWithCounts, page, limit);
    const { data, pagination } = paginate(posWithCounts, page, limit);

    return res.json({
      success: true,
      message: "Data berhasil diambil",
      data,
      pagination
    });
    //return successResponse(res, result, "Daftar Purchase Order");
  } catch (error) {
    next(error);
  }
};

export const getPOById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const po = await storage.getPurchaseOrderById(id);
    
    if (!po) {
      return errorResponse(res, "Purchase Order tidak ditemukan", 404);
    }
    
    const items = await storage.getPOItemsByPOId(id);
    
    return successResponse(res, { ...po, items }, "Detail Purchase Order");
  } catch (error) {
    next(error);
  }
};

export const createPO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    
    if (!['admin', 'tim_konstruksi', 'tim_procurement'].includes(user.role)) {
      return errorResponse(res, "Anda tidak memiliki akses untuk membuat PO", 403);
    }
    
    const { category, notes, items } = req.body;
    
    if (!items || items.length === 0) {
      return errorResponse(res, "PO harus memiliki minimal 1 item", 400);
    }
    
    const poNumber = await storage.generatePONumber();
    
    const po = await storage.createPurchaseOrder({
      poNumber,
      category,
      notes,
      totalAmount: "0",
      status: "draft",
      createdBy: user.id,
      createdByRole: user.role as "tim_konstruksi" | "tim_procurement",
    });
    
    let totalAmount = 0;
    for (const item of items) {
      const unitPrice = item.unitPrice || null;
      const totalPrice = unitPrice ? item.quantity * unitPrice : null;
      
      await storage.createPOItem({
        poId: po.id,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: unitPrice ? unitPrice.toString() : null,
        totalPrice: totalPrice ? totalPrice.toString() : null,
        notes: item.notes,
      });
      
      if (totalPrice) {
        totalAmount += totalPrice;
      }
    }
    
    await storage.updatePurchaseOrder(po.id, {
      totalAmount: totalAmount.toString(),
    });
    
    return successResponse(res, {
      id: po.id,
      poNumber: po.poNumber,
      status: po.status,
      totalAmount,
    }, "Purchase Order berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};

export const inputPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    
    if (user.role !== 'tim_procurement') {
      return errorResponse(res, "Hanya tim procurement yang dapat input harga", 403);
    }
    
    const po = await storage.getPurchaseOrderById(id);
    if (!po) {
      return errorResponse(res, "Purchase Order tidak ditemukan", 404);
    }
    
    if (po.createdByRole !== 'tim_konstruksi') {
      return errorResponse(res, "Hanya PO dari tim konstruksi yang perlu input harga", 400);
    }
    
    if (po.status !== 'draft') {
      return errorResponse(res, "PO sudah diproses, tidak dapat diubah", 400);
    }
    
    const { items } = req.body;
    
    let totalAmount = 0;
    for (const item of items) {
      const totalPrice = item.quantity * item.unitPrice;
      
      await storage.updatePOItem(item.id, {
        unitPrice: item.unitPrice.toString(),
        totalPrice: totalPrice.toString(),
      });
      
      totalAmount += totalPrice;
    }
    
    await storage.updatePurchaseOrder(id, {
      totalAmount: totalAmount.toString(),
    });
    
    return successResponse(res, {
      poNumber: po.poNumber,
      totalAmount,
    }, "Harga berhasil diinput");
  } catch (error) {
    next(error);
  }
};

export const submitPO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    
    if (user.role !== 'tim_procurement') {
      return errorResponse(res, "Hanya tim procurement yang dapat submit PO", 403);
    }
    
    const po = await storage.getPurchaseOrderById(id);
    if (!po) {
      return errorResponse(res, "Purchase Order tidak ditemukan", 404);
    }
    
    if (po.status !== 'draft') {
      return errorResponse(res, "PO sudah di-submit", 400);
    }
    
    const items = await storage.getPOItemsByPOId(id);
    const hasIncompletePrices = items.some(item => !item.unitPrice || !item.totalPrice);
    
    if (hasIncompletePrices) {
      return errorResponse(res, "Semua item harus memiliki harga sebelum di-submit", 400);
    }
    
    await storage.updatePurchaseOrder(id, {
      status: "pending_review",
    });
    
    return successResponse(res, {
      poNumber: po.poNumber,
      status: "pending_review",
    }, "PO berhasil di-submit untuk review");
  } catch (error) {
    next(error);
  }
};


export const approveByKetua = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const user = req.user!;
    const id = parseInt(req.params.id);
    const { action, selectedItems, rejectionReason } = req.body;
    
    const po = await storage.getPurchaseOrderById(id);
    if (!po) {
      return errorResponse(res, "Purchase Order tidak ditemukan", 404);
    }

    if (po.status !== 'approved_bendahara') {
      return errorResponse(res, "PO harus di-approve bendahara terlebih dahulu", 400);
    }

    if (action === 'reject') {
      // Update PO
      await storage.updatePurchaseOrder(id, {
        status: "rejected",
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason,
      });
      
      // Update cash flow to rejected
      if (po.cashFlowId) {
        await storage.updateTransactionStatus(po.cashFlowId, 'rejected', user.id);
      }
      
      return res.json({
        success: true,
        message: "PO ditolak",
        data: {
          poNumber: po.poNumber,
          status: "rejected",
        },
      });
    }
    
    // Approve
    await storage.updatePurchaseOrder(id, {
      status: "approved_ketua",
      approvedByKetua: user.id,
      approvedByKetuaAt: new Date(),
    });
    
    // Update cash flow to approved
    if (po.cashFlowId) {
      await storage.updateTransactionStatus(po.cashFlowId, 'approved', user.id);
    }
    
    
    return successResponse(res, {
      poNumber: po.poNumber,
      status: "approved_ketua",
      cashFlowUpdated: true,
    }, "PO berhasil di-approve ketua");

  } catch (error) {
    next(error);
  } 
}

export const reviewByBendahara = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    const { action, selectedItems, rejectionReason } = req.body;
    
    const po = await storage.getPurchaseOrderById(id);
    if (!po) {
      return errorResponse(res, "Purchase Order tidak ditemukan", 404);
    }
    
    if (po.status !== 'pending_review') {
      return errorResponse(res, "PO tidak dalam status review", 400);
    }
    
    if (action === 'reject') {
      await storage.updatePurchaseOrder(id, {
        status: "rejected",
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason,
      });
      
      if (po.cashFlowId) {
        await storage.updateTransactionStatus(po.cashFlowId, 'rejected', user.id);
      }
      
      return successResponse(res, {
        poNumber: po.poNumber,
        status: "rejected",
      }, "PO ditolak");
    }
    
    // Approve - update item selections
    const allItems = await storage.getPOItemsByPOId(id);
    
    for (const item of allItems) {
      const isSelected = selectedItems.includes(item.id);
      await storage.updatePOItemSelection(item.id, isSelected);
    }
    
    // Recalculate total amount
    const selectedItemsData = allItems.filter(item => selectedItems.includes(item.id));
    const totalAmount = selectedItemsData.reduce(
      (sum, item) => sum + Number(item.totalPrice || 0),
      0
    );
    
    // Generate cash flow description
    const itemDescriptions = selectedItemsData.map(item =>
      `${item.itemName} ${item.quantity} ${item.unit}(${Number(item.totalPrice).toLocaleString('id-ID')})`
    );
    const description = `pembelian ${itemDescriptions.join(' dan ')}`;
    
    // Create cash flow entry (using transactions table)
    const cashFlow = await storage.createTransaction({
      type: "pengeluaran",
      category: po.category,
      description,
      amount: totalAmount.toString(),
      status: "pending",
      createdBy: user.id,
      createdByTeam: "admin",
      transactionDate: new Date(),
    });
    
    // Update PO
    await storage.updatePurchaseOrder(id, {
      status: "approved_bendahara",
      totalAmount: totalAmount.toString(),
      reviewedByBendahara: user.id,
      reviewedByBendaharaAt: new Date(),
      cashFlowId: cashFlow.id,
    });
      
      
    return successResponse(res, {
      poNumber: po.poNumber,
      status: "approved_bendahara",
      totalAmount,
      cashFlowId: cashFlow.id,
    }, "PO berhasil di-approve dan masuk ke cash flow");
  } catch (error) {
    next(error);
  }
};

export const deletePO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    
    const po = await storage.getPurchaseOrderById(id);
    if (!po) {
      return errorResponse(res, "Purchase Order tidak ditemukan", 404);
    }
    
    if (po.createdBy !== user.id) {
      return errorResponse(res, "Anda tidak dapat menghapus PO ini", 403);
    }
    
    if (po.status !== 'draft') {
      return errorResponse(res, "Hanya PO dengan status draft yang dapat dihapus", 400);
    }
    
    await storage.deletePurchaseOrder(id);
    return successResponse(res, null, "Purchase Order berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
