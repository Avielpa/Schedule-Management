// Schedule validation utilities

/**
 * Validates event scheduling parameters and provides suggestions
 * @param {Object} event - Event object with scheduling parameters
 * @returns {Object} - { isValid, errors, warnings, suggestions }
 */
export const validateSchedulingParameters = (event) => {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  if (!event.start_date || !event.end_date) {
    return { isValid: false, errors: ['Start date and end date are required'], warnings: [], suggestions: [] };
  }

  // Calculate total days
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const baseDays = event.base_days_per_soldier || 0;
  const homeDays = event.home_days_per_soldier || 0;
  const maxConsecBase = event.max_consecutive_base_days || 7;
  const maxConsecHome = event.max_consecutive_home_days || 10;
  const minBaseBlock = event.min_base_block_days || 3;

  // Check if base + home days equals total days
  if (baseDays + homeDays !== totalDays) {
    warnings.push(
      `Total days (${totalDays}) doesn't match base days (${baseDays}) + home days (${homeDays}) = ${baseDays + homeDays}`
    );
    suggestions.push(
      `Adjust to: Base Days = ${Math.floor(totalDays * 0.5)}, Home Days = ${Math.ceil(totalDays * 0.5)}`
    );
  }

  // Check if base days can fit within consecutive limits
  const minBaseBlocks = Math.ceil(baseDays / maxConsecBase);
  const minHomeGaps = minBaseBlocks - 1; // Gaps between base blocks
  const minHomePerGap = minBaseBlock; // Each gap needs at least min_base_block_days

  if (baseDays > 0) {
    // Check if base days are achievable
    const maxPossibleBaseDays = maxConsecBase * Math.floor(totalDays / (maxConsecBase + minBaseBlock));
    if (baseDays > maxPossibleBaseDays) {
      errors.push(
        `Cannot fit ${baseDays} base days in ${totalDays} days with max ${maxConsecBase} consecutive base days`
      );
      suggestions.push(
        `Either: Increase max consecutive base days to ${Math.ceil(baseDays / 2)} OR reduce base days to ${maxPossibleBaseDays}`
      );
    }
  }

  // Check if home days can fit within consecutive limits
  if (homeDays > 0) {
    const minHomeBlocks = Math.ceil(homeDays / maxConsecHome);
    const requiredTransitions = minHomeBlocks - 1;

    // Each transition requires returning to base for at least minBaseBlock days
    const homeBlocksWithGaps = homeDays + (requiredTransitions * minBaseBlock);

    if (homeBlocksWithGaps > totalDays) {
      errors.push(
        `Cannot fit ${homeDays} home days with max ${maxConsecHome} consecutive home days. Need ${minHomeBlocks} home blocks requiring ${requiredTransitions} transitions.`
      );

      const recommendedMaxConsecHome = Math.ceil(homeDays / 2);
      suggestions.push(
        `Increase max consecutive home days to at least ${recommendedMaxConsecHome}`
      );
    }
  }

  // Check minimum base block compatibility
  if (minBaseBlock > maxConsecBase) {
    errors.push(
      `Minimum base block (${minBaseBlock}) cannot be larger than max consecutive base days (${maxConsecBase})`
    );
    suggestions.push(`Set minimum base block to ${Math.min(3, maxConsecBase)}`);
  }

  // Warn about tight constraints
  if (baseDays > 0 && homeDays > 0) {
    const baseUtilization = baseDays / totalDays;
    const avgBaseBlock = baseDays / minBaseBlocks;
    const avgHomeBlock = homeDays / Math.ceil(homeDays / maxConsecHome);

    if (baseUtilization > 0.65 && maxConsecBase < 10) {
      warnings.push(
        `High base day requirement (${Math.round(baseUtilization * 100)}%) with low max consecutive base days may cause issues`
      );
      suggestions.push(`Consider increasing max consecutive base days to ${Math.ceil(baseDays / 2)}`);
    }

    if (avgHomeBlock > maxConsecHome * 0.8) {
      warnings.push(
        `Home days configuration is tight. Average home block (${avgHomeBlock.toFixed(1)}) is close to max (${maxConsecHome})`
      );
    }
  }

  // Check minimum soldiers per day
  const minSoldiers = event.min_required_soldiers_per_day || 0;
  if (minSoldiers < 1) {
    warnings.push('Minimum required soldiers per day should be at least 1');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    stats: {
      totalDays,
      baseDays,
      homeDays,
      minBaseBlocks,
      minHomeBlocks: Math.ceil(homeDays / maxConsecHome),
      feasibilityScore: calculateFeasibilityScore(event, totalDays)
    }
  };
};

/**
 * Calculate a feasibility score (0-100) for the scheduling parameters
 */
const calculateFeasibilityScore = (event, totalDays) => {
  let score = 100;

  const baseDays = event.base_days_per_soldier || 0;
  const homeDays = event.home_days_per_soldier || 0;
  const maxConsecBase = event.max_consecutive_base_days || 7;
  const maxConsecHome = event.max_consecutive_home_days || 10;

  // Penalize if days don't add up
  if (Math.abs((baseDays + homeDays) - totalDays) > 0) {
    score -= 20;
  }

  // Penalize if consecutive limits are too restrictive
  const minBaseBlocks = Math.ceil(baseDays / maxConsecBase);
  const minHomeBlocks = Math.ceil(homeDays / maxConsecHome);
  const totalBlocks = minBaseBlocks + minHomeBlocks;

  if (totalBlocks > totalDays / 3) {
    score -= 30; // Too many transitions needed
  }

  // Penalize if base utilization is very high with low consecutive limits
  const baseUtilization = baseDays / totalDays;
  if (baseUtilization > 0.7 && maxConsecBase < totalDays / 4) {
    score -= 25;
  }

  return Math.max(0, score);
};

/**
 * Generate recommended parameters based on event duration
 */
export const generateRecommendedParameters = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const baseDays = Math.floor(totalDays * 0.5);
  const homeDays = totalDays - baseDays;
  const maxConsecBase = Math.max(5, Math.min(10, Math.floor(totalDays / 3)));
  const maxConsecHome = Math.max(7, Math.min(14, Math.floor(totalDays / 2.5)));
  const minBaseBlock = Math.min(3, Math.floor(maxConsecBase / 2));

  return {
    base_days_per_soldier: baseDays,
    home_days_per_soldier: homeDays,
    max_consecutive_base_days: maxConsecBase,
    max_consecutive_home_days: maxConsecHome,
    min_base_block_days: minBaseBlock,
    min_required_soldiers_per_day: 8,
  };
};

/**
 * Format validation result for display
 */
export const formatValidationMessage = (validation) => {
  const parts = [];

  if (!validation.isValid) {
    parts.push('❌ **Configuration Issues:**');
    validation.errors.forEach((error) => parts.push(`  • ${error}`));
  }

  if (validation.warnings.length > 0) {
    parts.push('\n⚠️ **Warnings:**');
    validation.warnings.forEach((warning) => parts.push(`  • ${warning}`));
  }

  if (validation.suggestions.length > 0) {
    parts.push('\n💡 **Suggestions:**');
    validation.suggestions.forEach((suggestion) => parts.push(`  • ${suggestion}`));
  }

  if (validation.stats) {
    parts.push(`\n📊 **Stats:** ${validation.stats.totalDays} days, ${validation.stats.minBaseBlocks} base blocks, ${validation.stats.minHomeBlocks} home blocks`);
    parts.push(`   Feasibility Score: ${validation.stats.feasibilityScore}/100`);
  }

  return parts.join('\n');
};
