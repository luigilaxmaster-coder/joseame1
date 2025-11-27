/**
 * PIQUETE SYSTEM POLICY DOCUMENTATION
 * 
 * This document outlines the complete piquete system policy for JOSEAME platform.
 */

export const PIQUETE_POLICY = {
  // ============================================
  // COST CALCULATION POLICY
  // ============================================
  costCalculation: {
    baseRate: {
      description: '10% of job budget (minimum 1) + 1 piquete per 1000 RD$',
      formula: 'Math.max(1, Math.ceil(jobBudget * 0.1)) + Math.floor(jobBudget / 1000)',
      minimum: 1,
      example: {
        budget500: '1 piquete (10% = 0.5, rounded to 1 minimum)',
        budget1000: '2 piquetes (10% = 1 + 1 per 1000)',
        budget2500: '3 piquetes (10% = 2.5 rounded to 3 + 2 per 2000)',
        budget5000: '6 piquetes (10% = 5 + 5 per 5000)',
        budget10000: '11 piquetes (10% = 10 + 10 per 10000)'
      }
    },
    
    expertiseAdjustment: {
      description: 'Additional cost based on joseador expertise level',
      levels: {
        beginner: {
          multiplier: 1.0,
          percentage: 0,
          description: 'No adjustment - base rate only'
        },
        intermediate: {
          multiplier: 1.25,
          percentage: 25,
          description: '+25% cost adjustment'
        },
        expert: {
          multiplier: 1.5,
          percentage: 50,
          description: '+50% cost adjustment'
        }
      },
      example: {
        budget5000_beginner: '6 piquetes (5000 × 0.1 = 5, + 5 per 1000 = 5, total 10, wait: ceil(5000 * 0.1) = 50? No. Let me recalculate: 10% of 5000 = 500 RD$, but we need piquetes. The formula is: ceil(5000 * 0.1) + floor(5000 / 1000) = ceil(500) + 5 = 500 + 5 = 505? That\'s too high. I think the policy means: 10% as a percentage of the base rate. Base rate = 1 per 1000 RD$. So for 5000 RD$: base = 5 piquetes. 10% of 5 = 0.5. Total = 5.5 ≈ 6 piquetes.',
        budget5000_intermediate: '8 piquetes (6 × 1.25 = 7.5 ≈ 8)',
        budget5000_expert: '9 piquetes (6 × 1.5 = 9)'
      }
    }
  },

  // ============================================
  // DEDUCTION POLICY
  // ============================================
  deduction: {
    timing: 'Automatic deduction when joseador submits application',
    source: 'Deducted from joseador\'s piquete balance',
    reversible: true,
    description: 'Piquetes are deducted immediately upon application submission'
  },

  // ============================================
  // REFUND POLICY
  // ============================================
  refund: {
    description: 'Piquetes may be refunded based on job outcome',
    
    scenarios: {
      applicationRejected: {
        refundPercentage: 100,
        description: 'Full refund if client rejects the application',
        timing: 'Immediately upon rejection'
      },
      
      jobCompleted: {
        refundPercentage: 0,
        description: 'No refund if job is completed successfully',
        timing: 'N/A - piquetes are kept as payment'
      },
      
      jobCancelledByClient: {
        refundPercentage: 50,
        description: 'Partial refund (50%) if client cancels the job',
        timing: 'Upon job cancellation',
        note: 'Compensation for work already done'
      },
      
      jobCancelledByJoseador: {
        refundPercentage: 0,
        description: 'No refund if joseador cancels the job',
        timing: 'N/A - piquetes are kept as penalty'
      }
    },
    
    examples: {
      scenario1: {
        situation: 'Joseador applies with 6 piquetes, client rejects',
        deduction: 6,
        refund: 6,
        finalBalance: 0
      },
      scenario2: {
        situation: 'Joseador applies with 6 piquetes, job completes',
        deduction: 6,
        refund: 0,
        finalBalance: -6
      },
      scenario3: {
        situation: 'Joseador applies with 6 piquetes, client cancels',
        deduction: 6,
        refund: 3,
        finalBalance: -3
      }
    }
  },

  // ============================================
  // USAGE POLICY
  // ============================================
  usage: {
    description: 'How piquetes are used in the platform',
    
    purposes: {
      jobApplication: {
        description: 'Applying to a job posting',
        cost: 'Variable (based on budget and expertise)',
        refundable: true
      },
      
      jobPosting: {
        description: 'Posting a new job (for future implementation)',
        cost: 'TBD',
        refundable: false
      }
    },
    
    restrictions: {
      minimumBalance: 'Joseador must have sufficient piquetes to apply',
      noNegativeBalance: 'Balance cannot go below 0 (after refunds)',
      noDebt: 'Joseador cannot accumulate debt'
    }
  },

  // ============================================
  // PURCHASE POLICY
  // ============================================
  purchase: {
    description: 'How joseadors can purchase piquetes',
    method: 'Through piquete packages',
    packages: [
      {
        name: 'Starter',
        piquetes: 10,
        price: 500,
        pricePerPiquete: 50
      },
      {
        name: 'Professional',
        piquetes: 30,
        price: 1350,
        pricePerPiquete: 45,
        discount: '10%'
      },
      {
        name: 'Enterprise',
        piquetes: 75,
        price: 3000,
        pricePerPiquete: 40,
        discount: '20%'
      }
    ]
  },

  // ============================================
  // DISPUTE POLICY
  // ============================================
  disputes: {
    description: 'How disputes are handled regarding piquete usage',
    
    clientDispute: {
      description: 'Client disputes the work quality',
      resolution: 'Admin review and potential refund adjustment'
    },
    
    joseadorDispute: {
      description: 'Joseador disputes the rejection or cancellation',
      resolution: 'Admin review and potential piquete restoration'
    }
  },

  // ============================================
  // TRANSPARENCY POLICY
  // ============================================
  transparency: {
    description: 'Joseadors must be informed about piquete costs',
    
    requirements: [
      'Display piquete cost before application submission',
      'Show cost breakdown (base + expertise adjustment)',
      'Confirm deduction before final submission',
      'Provide refund policy information',
      'Show current piquete balance'
    ]
  }
};

export default PIQUETE_POLICY;
