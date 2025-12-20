/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: auditlogs
 * Interface for SystemAuditLogs
 */
export interface SystemAuditLogs {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  actionType?: string;
  /** @wixFieldType text */
  actorId?: string;
  /** @wixFieldType text */
  targetResourceType?: string;
  /** @wixFieldType text */
  targetResourceId?: string;
  /** @wixFieldType datetime */
  timestamp?: Date | string;
  /** @wixFieldType text */
  details?: string;
}


/**
 * Collection ID: jobapplications
 * Interface for JobApplications
 */
export interface JobApplications {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  jobId?: string;
  /** @wixFieldType text */
  joseadorId?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType datetime */
  applicationDate?: Date | string;
  /** @wixFieldType text */
  coverLetter?: string;
  /** @wixFieldType number */
  proposedPrice?: number;
}


/**
 * Collection ID: jobdisputes
 * Interface for DisputasdeTrabajos
 */
export interface DisputasdeTrabajos {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  raisedByRole?: string;
  /** @wixFieldType datetime */
  raisedAt?: Date | string;
  /** @wixFieldType text */
  jobTitle?: string;
  /** @wixFieldType text */
  clientDisplayName?: string;
  /** @wixFieldType text */
  joseadorDisplayName?: string;
  /** @wixFieldType text */
  resolutionDetails?: string;
  /** @wixFieldType text */
  adminNotes?: string;
}


/**
 * Collection ID: messages
 * Interface for Messages
 */
export interface Messages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  chatId?: string;
  /** @wixFieldType text */
  senderId?: string;
  /** @wixFieldType text */
  messageType?: string;
  /** @wixFieldType text */
  content?: string;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
  /** @wixFieldType multi_reference */
  renegotiationoffers?: RenegotiationOffers[];
}


/**
 * Collection ID: piquetebalances
 * Interface for PiqueteBalances
 */
export interface PiqueteBalances {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  joseadorId?: string;
  /** @wixFieldType number */
  freeQuotaBalance?: number;
  /** @wixFieldType text */
  joseadorEmail?: string;
  /** @wixFieldType text */
  joseadorName?: string;
  /** @wixFieldType number */
  currentBalance?: number;
  /** @wixFieldType number */
  totalPiquetesEarned?: number;
  /** @wixFieldType number */
  totalPiquetesSpent?: number;
  /** @wixFieldType datetime */
  lastUpdated?: Date | string;
}


/**
 * Collection ID: piquetepackages
 * Interface for PiquetePackages
 */
export interface PiquetePackages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  name?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType number */
  price?: number;
  /** @wixFieldType number */
  credits?: number;
  /** @wixFieldType boolean */
  isActive?: boolean;
  /** @wixFieldType image */
  packageImage?: string;
}


/**
 * Collection ID: piquetepurchases
 * Interface for PiquetePurchases
 */
export interface PiquetePurchases {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  joseadorEmail?: string;
  /** @wixFieldType text */
  packageId?: string;
  /** @wixFieldType text */
  packageName?: string;
  /** @wixFieldType number */
  amountPaid?: number;
  /** @wixFieldType number */
  piquetesQuantity?: number;
  /** @wixFieldType text */
  paymentStatus?: string;
  /** @wixFieldType text */
  wixPayOrderId?: string;
  /** @wixFieldType datetime */
  purchaseDateTime?: Date | string;
}


/**
 * Collection ID: profilephotos
 * Interface for ProfilePhotos
 */
export interface ProfilePhotos {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType image */
  photo?: string;
  /** @wixFieldType text */
  caption?: string;
  /** @wixFieldType datetime */
  uploadDate?: Date | string;
  /** @wixFieldType number */
  likeCount?: number;
  /** @wixFieldType text */
  uploaderId?: string;
}


/**
 * Collection ID: registeredusers
 * Interface for RegisteredUsers
 */
export interface RegisteredUsers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  userId?: string;
  /** @wixFieldType text */
  email?: string;
  /** @wixFieldType text */
  firstName?: string;
  /** @wixFieldType text */
  lastName?: string;
  /** @wixFieldType text */
  nickname?: string;
  /** @wixFieldType url */
  photoUrl?: string;
  /** @wixFieldType datetime */
  registrationDate?: Date | string;
  /** @wixFieldType datetime */
  lastLoginDate?: Date | string;
  /** @wixFieldType text */
  role?: string;
}


/**
 * Collection ID: renegotiationoffers
 * Interface for RenegotiationOffers
 */
export interface RenegotiationOffers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  jobId?: string;
  /** @wixFieldType multi_reference */
  relatedmessages?: Messages[];
  /** @wixFieldType text */
  offeringUserId?: string;
  /** @wixFieldType text */
  receivingUserId?: string;
  /** @wixFieldType number */
  currentPrice?: number;
  /** @wixFieldType number */
  proposedPrice?: number;
  /** @wixFieldType text */
  reason?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
}


/**
 * Collection ID: reportattachments
 * Interface for ReportAttachments
 */
export interface ReportAttachments {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  fileName?: string;
  /** @wixFieldType url */
  fileUrl?: string;
  /** @wixFieldType number */
  fileSize?: number;
  /** @wixFieldType text */
  fileType?: string;
  /** @wixFieldType datetime */
  uploadDate?: Date | string;
  /** @wixFieldType boolean */
  isEvidence?: boolean;
  /** @wixFieldType multi_reference */
  userreports?: UserReports[];
}


/**
 * Collection ID: reportevents
 * Interface for ReportEvents
 */
export interface ReportEvents {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  reportId?: string;
  /** @wixFieldType text */
  actionType?: string;
  /** @wixFieldType text */
  performedByUserId?: string;
  /** @wixFieldType datetime */
  performedAt?: Date | string;
  /** @wixFieldType text */
  oldValue?: string;
  /** @wixFieldType text */
  newValue?: string;
  /** @wixFieldType text */
  comment?: string;
  /** @wixFieldType multi_reference */
  userreports?: UserReports[];
}


/**
 * Collection ID: reportreasons
 * Interface for ReportReasons
 */
export interface ReportReasons {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  reasonCode?: string;
  /** @wixFieldType text */
  label?: string;
  /** @wixFieldType number */
  severity?: number;
  /** @wixFieldType boolean */
  requiresEvidence?: boolean;
  /** @wixFieldType number */
  autoPriority?: number;
}


/**
 * Collection ID: servicejobs
 * Interface for TrabajosdeServicio
 */
export interface TrabajosdeServicio {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  jobTitle?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  serviceCategory?: string;
  /** @wixFieldType number */
  budget?: number;
  /** @wixFieldType text */
  locationAddress?: string;
  /** @wixFieldType number */
  latitude?: number;
  /** @wixFieldType number */
  longitude?: number;
  /** @wixFieldType datetime */
  postedDate?: Date | string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType image */
  jobImage?: string;
}


/**
 * Collection ID: userdirectory
 * Interface for UserDirectory
 */
export interface UserDirectory {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  memberId?: string;
  /** @wixFieldType text */
  fullName?: string;
  /** @wixFieldType text */
  email?: string;
  /** @wixFieldType datetime */
  createdDate?: Date | string;
  /** @wixFieldType datetime */
  lastSeen?: Date | string;
  /** @wixFieldType text */
  verificationStatus?: string;
  /** @wixFieldType boolean */
  isActive?: boolean;
}


/**
 * Collection ID: userratings
 * Interface for UserRatings
 */
export interface UserRatings {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  ratingValue?: number;
  /** @wixFieldType text */
  reviewText?: string;
  /** @wixFieldType datetime */
  ratingDate?: Date | string;
  /** @wixFieldType text */
  ratedUserIdentifier?: string;
  /** @wixFieldType text */
  reviewerIdentifier?: string;
}


/**
 * Collection ID: userreports
 * Interface for UserReports
 */
export interface UserReports {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType reference */
  reportreason?: ReportReasons;
  /** @wixFieldType multi_reference */
  sanctions?: UserSanctions[];
  /** @wixFieldType multi_reference */
  events?: ReportEvents[];
  /** @wixFieldType multi_reference */
  attachments?: ReportAttachments[];
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  reasonCode?: string;
  /** @wixFieldType text */
  reasonLabelSnapshot?: string;
  /** @wixFieldType number */
  severity?: number;
  /** @wixFieldType number */
  priority?: number;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  reporterId?: string;
  /** @wixFieldType text */
  targetUserId?: string;
  /** @wixFieldType text */
  threadId?: string;
  /** @wixFieldType text */
  jobOrderId?: string;
  /** @wixFieldType text */
  messageIds?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  assignedTo?: string;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
  /** @wixFieldType datetime */
  updatedAt?: Date | string;
}


/**
 * Collection ID: usersanctions
 * Interface for UserSanctions
 */
export interface UserSanctions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  sanctionType?: string;
  /** @wixFieldType text */
  targetUserId?: string;
  /** @wixFieldType text */
  sanctionReason?: string;
  /** @wixFieldType text */
  appliedBy?: string;
  /** @wixFieldType datetime */
  appliedAt?: Date | string;
  /** @wixFieldType datetime */
  startDate?: Date | string;
  /** @wixFieldType datetime */
  endDate?: Date | string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType boolean */
  isPermanent?: boolean;
  /** @wixFieldType multi_reference */
  userreports?: UserReports[];
}


/**
 * Collection ID: userverification
 * Interface for UserVerification
 */
export interface UserVerification {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  joseadorId?: string;
  /** @wixFieldType text */
  joseadorEmail?: string;
  /** @wixFieldType text */
  joseadorName?: string;
  /** @wixFieldType boolean */
  isVerified?: boolean;
  /** @wixFieldType datetime */
  verificationDate?: Date | string;
  /** @wixFieldType text */
  verifiedByAdmin?: string;
}

/**
 * Collection ID: reportreasons
 * Interface for ReportReasons
 */
export interface ReportReasons {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  reasonCode?: string;
  /** @wixFieldType text */
  label?: string;
  /** @wixFieldType number */
  severity?: number;
  /** @wixFieldType boolean */
  requiresEvidence?: boolean;
  /** @wixFieldType number */
  autoPriority?: number;
}

/**
 * Collection ID: userreports
 * Interface for UserReports
 */
export interface UserReports {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  reasonCode?: string;
  /** @wixFieldType text */
  reasonLabelSnapshot?: string;
  /** @wixFieldType number */
  severity?: number;
  /** @wixFieldType number */
  priority?: number;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  reporterId?: string;
  /** @wixFieldType text */
  targetUserId?: string;
  /** @wixFieldType text */
  threadId?: string;
  /** @wixFieldType text */
  jobOrderId?: string;
  /** @wixFieldType text */
  messageIds?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  assignedTo?: string;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
  /** @wixFieldType datetime */
  updatedAt?: Date | string;
}

/**
 * Collection ID: reportattachments
 * Interface for ReportAttachments
 */
export interface ReportAttachments {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  fileName?: string;
  /** @wixFieldType url */
  fileUrl?: string;
  /** @wixFieldType number */
  fileSize?: number;
  /** @wixFieldType text */
  fileType?: string;
  /** @wixFieldType datetime */
  uploadDate?: Date | string;
  /** @wixFieldType boolean */
  isEvidence?: boolean;
}

/**
 * Collection ID: reportevents
 * Interface for ReportEvents
 */
export interface ReportEvents {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  reportId?: string;
  /** @wixFieldType text */
  actionType?: string;
  /** @wixFieldType text */
  performedByUserId?: string;
  /** @wixFieldType datetime */
  performedAt?: Date | string;
  /** @wixFieldType text */
  oldValue?: string;
  /** @wixFieldType text */
  newValue?: string;
  /** @wixFieldType text */
  comment?: string;
}

/**
 * Collection ID: usersanctions
 * Interface for UserSanctions
 */
export interface UserSanctions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  sanctionType?: string;
  /** @wixFieldType text */
  targetUserId?: string;
  /** @wixFieldType text */
  sanctionReason?: string;
  /** @wixFieldType text */
  appliedBy?: string;
  /** @wixFieldType datetime */
  appliedAt?: Date | string;
  /** @wixFieldType datetime */
  startDate?: Date | string;
  /** @wixFieldType datetime */
  endDate?: Date | string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType boolean */
  isPermanent?: boolean;
}

/**
 * Collection ID: auditlogs
 * Interface for AuditLogs
 */
export interface AuditLogs {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  actionType?: string;
  /** @wixFieldType text */
  actorId?: string;
  /** @wixFieldType text */
  targetResourceType?: string;
  /** @wixFieldType text */
  targetResourceId?: string;
  /** @wixFieldType datetime */
  timestamp?: Date | string;
  /** @wixFieldType text */
  details?: string;
}
