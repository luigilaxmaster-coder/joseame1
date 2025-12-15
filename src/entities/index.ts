/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

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
