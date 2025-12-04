/**
 * Determines the appropriate chart scale based on data characteristics.
 *
 * Uses two criteria:
 * 1. Low coefficient of variation (CV < 10%): Small relative swings on large values
 *    → Use sqrt to amplify small changes
 * 2. High range ratio (max/min > threshold): Wide spread between smallest and largest
 *    → Use sqrt to make small values visible
 *
 * @param values - Array of numeric values to analyze
 * @param options - Configuration options
 * @param options.cvThreshold - CV threshold (default 0.1 = 10%)
 * @param options.rangeRatioThreshold - Max/min ratio threshold (default 10)
 * @returns 'sqrt' | 'linear'
 */
function getChartScale(
  values: number[],
  options: { cvThreshold?: number; rangeRatioThreshold?: number } = {}
): 'sqrt' | 'linear' {
  const { cvThreshold = 0.1, rangeRatioThreshold = 10 } = options

  const positiveValues = values.filter(v => v > 0)

  if (positiveValues.length === 0) return 'linear'

  const mean = positiveValues.reduce((a, b) => a + b, 0) / positiveValues.length

  if (mean === 0) return 'linear'

  // Check coefficient of variation (for small swings on large values)
  const variance =
    positiveValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    positiveValues.length

  const stdDev = Math.sqrt(variance)

  const cv = stdDev / Math.abs(mean)

  if (cv < cvThreshold) return 'sqrt'

  // Check range ratio (for wide spread between min and max)
  const min = Math.min(...positiveValues)

  const max = Math.max(...positiveValues)

  if (min > 0 && max / min > rangeRatioThreshold) return 'sqrt'

  return 'linear'
}

export default getChartScale
