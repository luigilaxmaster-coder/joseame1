/**
 * Piquete Calculator - Calculates piquete costs based on job budget and expertise level
 * 
 * Policy:
 * - Base: 10% of job budget in piquetes (minimum 1)
 * - Additional: 1 piquete per each 1000 RD$ of budget
 * - Expertise adjustments:
 *   - Beginner: +0% (base rate)
 *   - Intermediate: +25% (1.25x multiplier)
 *   - Expert: +50% (1.5x multiplier)
 * 
 * Refund Policy:
 * - If job is rejected: 100% refund
 * - If job is completed: No refund
 * - If job is cancelled by client: 50% refund
 */

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';

export interface PiqueteCalculation {
  basePiquetes: number;
  percentagePiquetes: number;
  additionalPiquetes: number;
  expertiseMultiplier: number;
  totalPiquetes: number;
  costBreakdown: string;
}

/**
 * Calculate piquetes required for a job application
 * @param jobBudget - Budget in RD$
 * @param expertiseLevel - Expertise level of the joseador
 * @returns Piquete calculation details
 */
export function calculatePiquetes(
  jobBudget: number,
  expertiseLevel: ExpertiseLevel = 'beginner'
): PiqueteCalculation {
  // Base calculation: 10% of job budget (minimum 1)
  const percentagePiquetes = Math.max(1, Math.ceil(jobBudget * 0.1));
  
  // Additional: 1 piquete per 1000 RD$
  const additionalPiquetes = Math.floor(jobBudget / 1000);
  
  // Total base piquetes
  const basePiquetes = percentagePiquetes + additionalPiquetes;

  // Expertise multipliers
  const multipliers: Record<ExpertiseLevel, number> = {
    beginner: 1.0,
    intermediate: 1.25,
    expert: 1.5,
  };

  const expertiseMultiplier = multipliers[expertiseLevel];
  const totalPiquetes = Math.ceil(basePiquetes * expertiseMultiplier);

  // Cost breakdown explanation
  const costBreakdown = `Base: ${percentagePiquetes} piquete${percentagePiquetes > 1 ? 's' : ''} (10% de RD$ ${jobBudget.toLocaleString()}) + ${additionalPiquetes} piquete${additionalPiquetes > 1 ? 's' : ''} (RD$ ${jobBudget.toLocaleString()} ÷ 1000) = ${basePiquetes} piquete${basePiquetes > 1 ? 's' : ''} ${
    expertiseLevel === 'beginner'
      ? '(sin ajuste por nivel)'
      : `+ ${Math.round((expertiseMultiplier - 1) * 100)}% por nivel ${expertiseLevel === 'intermediate' ? 'Intermedio' : 'Experto'}`
  } = ${totalPiquetes} piquete${totalPiquetes > 1 ? 's' : ''}`;

  return {
    basePiquetes,
    percentagePiquetes,
    additionalPiquetes,
    expertiseMultiplier,
    totalPiquetes,
    costBreakdown,
  };
}

/**
 * Calculate refund amount based on job status
 * @param totalPiquetesUsed - Total piquetes used for the application
 * @param jobStatus - Current status of the job
 * @returns Refund amount in piquetes
 */
export function calculateRefund(
  totalPiquetesUsed: number,
  jobStatus: 'rejected' | 'completed' | 'cancelled'
): number {
  const refundPercentages: Record<string, number> = {
    rejected: 1.0, // 100% refund
    completed: 0, // No refund
    cancelled: 0.5, // 50% refund
  };

  const refundPercentage = refundPercentages[jobStatus] || 0;
  return Math.ceil(totalPiquetesUsed * refundPercentage);
}

/**
 * Get expertise level description
 */
export function getExpertiseDescription(level: ExpertiseLevel): string {
  const descriptions: Record<ExpertiseLevel, string> = {
    beginner: 'Principiante - Tarifa base',
    intermediate: 'Intermedio - +25% de costo',
    expert: 'Experto - +50% de costo',
  };
  return descriptions[level];
}
