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
