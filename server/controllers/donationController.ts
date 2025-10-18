import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse } from "../utils/response";
import { paginate, getPaginationParams } from "../utils/pagination";

export const getAllDonations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, donorType, donationType, search } = req.query;
    const { page, limit } = getPaginationParams(req.query);
    
    let donations = await storage.getAllDonations();
    
    // Apply filters
    if (status) {
      donations = donations.filter(d => d.status === status);
    }
    if (donorType) {
      donations = donations.filter(d => d.donorType === donorType);
    }
    if (donationType) {
      donations = donations.filter(d => d.donationType === donationType);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      donations = donations.filter(d => 
        d.donorName.toLowerCase().includes(searchLower) ||
        (d.notes && d.notes.toLowerCase().includes(searchLower))
      );
    }
    
    const { data, pagination } = paginate(donations, page, limit);
    return res.json({
      success: true,
      message: "Data berhasil diambil",
      data,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const donation = await storage.getDonationById(id);
    
    if (!donation) {
      return errorResponse(res, "Donasi tidak ditemukan", 404);
    }
    
    return successResponse(res, donation, "Detail donasi");
  } catch (error) {
    next(error);
  }
};

export const createDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    
    if (!['bendahara', 'tim_pendanaan'].includes(user.role)) {
      return errorResponse(res, "Anda tidak memiliki akses untuk membuat donasi", 403);
    }
    
    const {
      donorName,
      donorEmail,
      donorPhone,
      donorType,
      donationType,
      amount,
      showName,
      paymentMethod,
      paymentProofUrl,
      notes,
      donationDate,
    } = req.body;
    
    if (!donorName || !amount) {
      return errorResponse(res, "Nama donatur dan jumlah harus diisi", 400);
    }

    const donation = await storage.createDonation({
      donorName,
      donorEmail,
      donorPhone,
      donorType: donorType || "warga",
      donationType: donationType || "sumbangan",
      amount: amount.toString(),
      showName: showName ? 1 : 0,
      status: "draft",
      createdBy: user.id,
      createdByRole: user.role as "bendahara" | "tim_pendanaan",
      paymentMethod,
      paymentProofUrl,
      notes,
      donationDate: new Date(donationDate),
    });
    
    return successResponse(res, donation, "Donasi berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};

export const updateDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    
    const donation = await storage.getDonationById(id);
    if (!donation) {
      return errorResponse(res, "Donasi tidak ditemukan", 404);
    }
    
    if (donation.createdBy !== user.id) {
      return errorResponse(res, "Anda tidak dapat mengubah donasi ini", 403);
    }
    
    if (donation.status !== 'draft') {
      return errorResponse(res, "Hanya donasi dengan status draft yang dapat diubah", 400);
    }
    
    const {
      donorName,
      donorEmail,
      donorPhone,
      donorType,
      donationType,
      amount,
      showName,
      paymentMethod,
      paymentProofUrl,
      notes,
      donationDate,
    } = req.body;
    
    await storage.updateDonation(id, {
      donorName,
      donorEmail,
      donorPhone,
      donorType,
      donationType,
      amount: amount ? amount.toString() : undefined,
      showName: showName !== undefined ? (showName ? 1 : 0) : undefined,
      paymentMethod,
      paymentProofUrl,
      notes,
      donationDate,
    });
    
    return successResponse(res, null, "Donasi berhasil diubah");
  } catch (error) {
    next(error);
  }
};

export const submitDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    
    const donation = await storage.getDonationById(id);
    if (!donation) {
      return errorResponse(res, "Donasi tidak ditemukan", 404);
    }
    
    if (donation.createdBy !== user.id) {
      return errorResponse(res, "Anda tidak dapat submit donasi ini", 403);
    }
    
    if (donation.status !== 'draft') {
      return errorResponse(res, "Donasi sudah di-submit", 400);
    }
    
    await storage.submitDonation(id);
    
    const newStatus = donation.createdByRole === 'bendahara' 
      ? 'approved_bendahara' 
      : 'pending_review';
    
    const message = donation.createdByRole === 'bendahara'
      ? "Donasi berhasil di-submit, menunggu approval ketua"
      : "Donasi berhasil di-submit untuk review bendahara";
    
    return successResponse(res, { status: newStatus }, message);
  } catch (error) {
    next(error);
  }
};

export const reviewByBendahara = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    const { action, rejectionReason } = req.body;
    
    const donation = await storage.getDonationById(id);
    if (!donation) {
      return errorResponse(res, "Donasi tidak ditemukan", 404);
    }
    
    if (donation.status !== 'pending_review') {
      return errorResponse(res, "Donasi tidak dalam status review", 400);
    }
    
    if (action === 'reject') {
      await storage.updateDonation(id, {
        status: "rejected",
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason,
      });
      
      return successResponse(res, { status: "rejected" }, "Donasi ditolak");
    }
    
    await storage.updateDonation(id, {
      status: "approved_bendahara",
      reviewedByBendahara: user.id,
      reviewedByBendaharaAt: new Date(),
    });
    
    return successResponse(res, { status: "approved_bendahara" }, "Donasi berhasil di-approve, menunggu approval ketua");
  } catch (error) {
    next(error);
  }
};

export const approveByKetua = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    const { action, rejectionReason } = req.body;
    
    const donation = await storage.getDonationById(id);
    if (!donation) {
      return errorResponse(res, "Donasi tidak ditemukan", 404);
    }
    
    if (donation.status !== 'approved_bendahara') {
      return errorResponse(res, "Donasi harus di-approve bendahara terlebih dahulu", 400);
    }
    
    if (action === 'reject') {
      await storage.updateDonation(id, {
        status: "rejected",
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason,
      });
      
      return successResponse(res, { status: "rejected" }, "Donasi ditolak");
    }
    
    const donorDisplay = donation.showName ? donation.donorName : "Hamba Allah";
    const typeLabel = donation.donationType === "iuran" ? "Iuran" : "Donasi";
    const description = `${typeLabel} dari ${donorDisplay}`;
    
    const cashFlow = await storage.createTransaction({
      type: "pemasukan",
      category: "Donasi",
      description,
      amount: donation.amount.toString(),
      status: "approved",
      createdBy: user.id,
      createdByTeam: "admin",
      transactionDate: donation.donationDate,
      approvedByKetua: user.id,
      approvedAt: new Date(),
    });
    
    await storage.updateDonation(id, {
      status: "approved",
      approvedBy: user.id,
      approvedAt: new Date(),
      cashFlowId: cashFlow.id,
    });
    
    return successResponse(res, {
      status: "approved",
      cashFlowId: cashFlow.id,
    }, "Donasi berhasil di-approve dan masuk ke cash flow");
  } catch (error) {
    next(error);
  }
};

export const deleteDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id);
    
    const donation = await storage.getDonationById(id);
    if (!donation) {
      return errorResponse(res, "Donasi tidak ditemukan", 404);
    }
    
    if (donation.createdBy !== user.id) {
      return errorResponse(res, "Anda tidak dapat menghapus donasi ini", 403);
    }
    
    if (donation.status !== 'draft') {
      return errorResponse(res, "Hanya donasi dengan status draft yang dapat dihapus", 400);
    }
    
    await storage.deleteDonation(id);
    return successResponse(res, null, "Donasi berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
