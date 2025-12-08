const sahhaService = require('./sahhaService');

/**
 * Transform Sahha insights data into the format expected by the frontend dashboard
 */
class HealthDataTransformService {
  /**
   * Get the latest score value from a trend
   */
  getLatestScoreValue(trend) {
    if (!trend || !trend.Data || trend.Data.length === 0) {
      return null;
    }
    // Get the most recent data point
    const sortedData = [...trend.Data].sort((a, b) => 
      new Date(b.StartDateTime || b.endDateTime) - new Date(a.StartDateTime || a.endDateTime)
    );
    return sortedData[0]?.Value || null;
  }

  /**
   * Get comparison value as a number
   */
  getComparisonValue(comparison) {
    if (!comparison || !comparison.Value) {
      return null;
    }
    // Extract numeric value from string (e.g., "85.5" or "85.5%")
    const numValue = parseFloat(comparison.Value.toString().replace(/[^0-9.-]/g, ''));
    return isNaN(numValue) ? null : numValue;
  }

  /**
   * Get trend change percentage
   */
  getTrendChange(trend) {
    if (!trend || !trend.Data || trend.Data.length < 2) {
      return 0;
    }
    const sortedData = [...trend.Data].sort((a, b) => 
      new Date(b.StartDateTime || b.endDateTime) - new Date(a.StartDateTime || a.endDateTime)
    );
    const latest = sortedData[0];
    return latest?.percentChangeFromPrevious || 0;
  }

  /**
   * Extract health metrics from insights
   */
  extractHealthMetrics(insights) {
    const metrics = {
      restingHeartRate: { value: null, unit: 'bpm', trend: 0, status: 'good' },
      heartRateVariability: { value: null, unit: 'ms', trend: 0, status: 'good' },
      sleepQuality: { hours: null, qualityScore: null, trend: 0, status: 'good' },
      activityLevel: { steps: null, activeMinutes: null, trend: 0, status: 'good' },
      heartRateRecovery: { value: null, unit: 'bpm', trend: 0, status: 'good' },
    };

    if (!insights || !insights.Comparisons) {
      return metrics;
    }

    // Map Sahha metrics to our health metrics
    insights.Comparisons.forEach(comparison => {
      const value = this.getComparisonValue(comparison);
      if (value === null) return;

      const name = (comparison.Name || '').toLowerCase();
      const category = (comparison.Category || '').toLowerCase();

      // Resting Heart Rate
      if (name.includes('resting') && name.includes('heart') && name.includes('rate')) {
        metrics.restingHeartRate.value = Math.round(value);
        metrics.restingHeartRate.trend = parseFloat(comparison.percentageDifference || '0');
        metrics.restingHeartRate.status = this.getStatusFromValue(comparison.State, value, comparison.isHigherBetter);
      }
      // Heart Rate Variability
      else if (name.includes('heart') && name.includes('variability')) {
        metrics.heartRateVariability.value = Math.round(value);
        metrics.heartRateVariability.trend = parseFloat(comparison.percentageDifference || '0');
        metrics.heartRateVariability.status = this.getStatusFromValue(comparison.State, value, comparison.isHigherBetter);
      }
      // Sleep
      else if (category.includes('sleep') || name.includes('sleep')) {
        if (name.includes('duration') || name.includes('hours')) {
          metrics.sleepQuality.hours = parseFloat(value.toFixed(1));
        } else if (name.includes('quality') || name.includes('score')) {
          metrics.sleepQuality.qualityScore = Math.round(value);
        }
        metrics.sleepQuality.trend = parseFloat(comparison.percentageDifference || '0');
        metrics.sleepQuality.status = this.getStatusFromValue(comparison.State, value, comparison.isHigherBetter);
      }
      // Activity
      else if (category.includes('activity') || name.includes('steps') || name.includes('active')) {
        if (name.includes('steps')) {
          metrics.activityLevel.steps = Math.round(value);
        } else if (name.includes('minutes') || name.includes('active')) {
          metrics.activityLevel.activeMinutes = Math.round(value);
        }
        metrics.activityLevel.trend = parseFloat(comparison.percentageDifference || '0');
        metrics.activityLevel.status = this.getStatusFromValue(comparison.State, value, comparison.isHigherBetter);
      }
      // Heart Rate Recovery
      else if (name.includes('recovery') && name.includes('heart')) {
        metrics.heartRateRecovery.value = Math.round(value);
        metrics.heartRateRecovery.trend = parseFloat(comparison.percentageDifference || '0');
        metrics.heartRateRecovery.status = this.getStatusFromValue(comparison.State, value, comparison.isHigherBetter);
      }
    });

    return metrics;
  }

  /**
   * Generate alerts from insights
   */
  generateAlerts(insights) {
    const alerts = [];

    if (!insights || !insights.Comparisons) {
      return alerts;
    }

    insights.Comparisons.forEach(comparison => {
      const state = comparison.State || '';
      const name = comparison.Name || '';
      
      if (state === 'at_risk' || state === 'warning') {
        alerts.push({
          id: alerts.length + 1,
          type: state === 'at_risk' ? 'warning' : 'info',
          message: `${name} is ${state === 'at_risk' ? 'concerning' : 'needs attention'}`,
          recommendation: this.getRecommendation(name, comparison),
        });
      }
    });

    return alerts;
  }

  /**
   * Calculate return to play status
   */
  calculateReturnToPlay(insights) {
    if (!insights || !insights.Comparisons || insights.Comparisons.length === 0) {
      return {
        status: 'caution',
        message: 'Insufficient data to determine return to play status',
        details: 'Continue monitoring and consult with your coach',
      };
    }

    // Count metrics in each state
    let readyCount = 0;
    let cautionCount = 0;
    let atRiskCount = 0;

    insights.Comparisons.forEach(comparison => {
      const state = (comparison.State || '').toLowerCase();
      if (state === 'good' || state === 'optimal') {
        readyCount++;
      } else if (state === 'caution' || state === 'warning') {
        cautionCount++;
      } else if (state === 'at_risk' || state === 'poor') {
        atRiskCount++;
      }
    });

    if (atRiskCount > 0) {
      return {
        status: 'notReady',
        message: 'Not ready for return to play',
        details: 'Multiple metrics indicate you need more recovery time',
      };
    } else if (cautionCount > readyCount) {
      return {
        status: 'caution',
        message: 'Estimated 3-5 days until return to play',
        details: 'Continue light activity, avoid contact sports',
      };
    } else {
      return {
        status: 'ready',
        message: 'Ready for return to play',
        details: 'All metrics indicate you are ready',
      };
    }
  }

  /**
   * Get status from Sahha state value
   */
  getStatusFromValue(state, value, isHigherBetter) {
    if (!state) return 'good';
    
    const stateLower = state.toLowerCase();
    if (stateLower === 'good' || stateLower === 'optimal' || stateLower === 'normal') {
      return 'good';
    } else if (stateLower === 'caution' || stateLower === 'warning') {
      return 'caution';
    } else if (stateLower === 'at_risk' || stateLower === 'poor' || stateLower === 'critical') {
      return 'atRisk';
    }
    return 'good';
  }

  /**
   * Format metric name for display
   */
  formatMetricName(name) {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Get recommendation based on metric
   */
  getRecommendation(metricName, comparison) {
    const name = (metricName || '').toLowerCase();
    const state = (comparison.State || '').toLowerCase();
    
    if (name.includes('heart') && name.includes('rate')) {
      if (state === 'at_risk') {
        return 'Consider reducing activity intensity and consult with a healthcare provider';
      }
      return 'Monitor closely and adjust activity as needed';
    } else if (name.includes('sleep')) {
      return 'Maintain consistent sleep schedule and aim for 7-9 hours';
    } else if (name.includes('activity')) {
      return 'Gradually increase activity level based on recovery status';
    }
    return 'Continue monitoring and follow your recovery plan';
  }

  /**
   * Format time ago string
   */
  formatTimeAgo(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Transform insights to health data format expected by frontend
   */
  transformToHealthData(insights, profileInfo = null) {
    if (!insights) {
      insights = { Trends: [], Comparisons: [] };
    }

    // Calculate overall health score from comparisons
    // Default to 0 if no data exists
    let healthScore = 0;
    let healthScoreTrend = 0;

    // Check if we have any actual data
    const hasComparisons = insights.Comparisons && insights.Comparisons.length > 0;
    const hasTrends = insights.Trends && insights.Trends.length > 0;
    const hasData = hasComparisons || hasTrends;

    if (hasComparisons) {
      let totalScore = 0;
      let count = 0;

      insights.Comparisons.forEach(comparison => {
        const value = this.getComparisonValue(comparison);
        if (value !== null) {
          // Normalize to 0-100 scale based on percentile or value
          let normalizedValue = comparison.Percentile || 50;
          if (comparison.isHigherBetter !== undefined) {
            // If we have a percentile, use it; otherwise estimate from state
            if (comparison.State) {
              const state = comparison.State.toLowerCase();
              if (state === 'good' || state === 'optimal') {
                normalizedValue = 80 + Math.random() * 15; // 80-95
              } else if (state === 'caution' || state === 'warning') {
                normalizedValue = 60 + Math.random() * 15; // 60-75
              } else if (state === 'at_risk' || state === 'poor') {
                normalizedValue = 30 + Math.random() * 20; // 30-50
              }
            }
          }
          totalScore += normalizedValue;
          count++;
        }
      });

      if (count > 0) {
        healthScore = Math.round(totalScore / count);
      }
    }

    // Calculate trend from trends data
    if (insights.Trends && insights.Trends.length > 0) {
      const scoreTrends = insights.Trends.filter(t => 
        (t.Name || '').toLowerCase().includes('score') ||
        (t.Category || '').toLowerCase().includes('score')
      );
      
      if (scoreTrends.length > 0) {
        const latestTrend = scoreTrends[0];
        healthScoreTrend = this.getTrendChange(latestTrend);
      }
    }

    // Extract metrics
    const healthMetrics = this.extractHealthMetrics(insights);

    // Generate alerts
    const alerts = this.generateAlerts(insights);

    // Calculate return to play
    const returnToPlayStatus = this.calculateReturnToPlay(insights);

    // Get last updated time
    let lastUpdated = 'Never';
    if (insights.Trends && insights.Trends.length > 0) {
      const allDates = insights.Trends
        .flatMap(t => t.Data || [])
        .map(d => d.StartDateTime || d.endDateTime)
        .filter(Boolean);
      if (allDates.length > 0) {
        const latestDate = allDates.sort((a, b) => new Date(b) - new Date(a))[0];
        lastUpdated = this.formatTimeAgo(latestDate);
      }
    }

    // Calculate recovery days estimate (simple heuristic)
    // If no data, set to 0 (can't estimate without data)
    const recoveryDaysEstimate = !hasData ? 0 :
                                 returnToPlayStatus.status === 'ready' ? 0 :
                                 returnToPlayStatus.status === 'caution' ? 5 : 7;

    // Determine health status - if no data, default to 'caution'
    let healthStatus = 'caution';
    if (hasData) {
      healthStatus = healthScore >= 80 ? 'good' : healthScore >= 60 ? 'caution' : 'atRisk';
    }

    return {
      healthScore,
      healthScoreTrend,
      recoveryDaysEstimate,
      lastUpdated,
      healthStatus,
      healthMetrics,
      alerts,
      returnToPlayStatus,
      rawTrendData: insights.Trends || [],
      rawComparisonData: insights.Comparisons || [],
    };
  }

  /**
   * Transform individual player data for coach dashboard
   */
  transformPlayerForCoachDashboard(player, healthData) {
    return {
      id: player._id.toString(),
      name: `${player.fName || ''} ${player.Lname || ''}`.trim() || 'Unknown Player',
      status: this.mapHealthStatusToDashboardStatus(healthData.healthStatus),
      healthScore: healthData.healthScore || 0,
      lastSync: healthData.lastUpdated || 'Never',
      healthStatus: healthData.healthStatus,
      healthMetrics: healthData.healthMetrics,
    };
  }

  /**
   * Map health status to dashboard status
   */
  mapHealthStatusToDashboardStatus(healthStatus) {
    switch (healthStatus) {
      case 'good':
        return 'Healthy';
      case 'caution':
        return 'Healthy'; // Or could be 'Caution' if you add that status
      case 'atRisk':
        return 'Injured';
      default:
        return 'Healthy';
    }
  }

  /**
   * Calculate team statistics from multiple players
   */
  calculateTeamStatistics(players) {
    if (!players || players.length === 0) {
      return {
        totalAthletes: 0,
        avgPerformance: 0,
        atRiskCount: 0,
        teamAverage: 0,
        previousAverage: null,
        averageChange: 0,
        barChartData: [],
        statusDistribution: {
          healthy: 0,
          injured: 0,
          suspended: 0,
        },
      };
    }

    // Calculate basic statistics
    const totalAthletes = players.length;
    let totalHealthScore = 0;
    let atRiskCount = 0;
    const statusCounts = { healthy: 0, injured: 0, suspended: 0 };

    // Aggregate metrics for bar chart
    const metricSums = {
      restingHeartRate: { sum: 0, count: 0 },
      heartRateVariability: { sum: 0, count: 0 },
      heartRateRecovery: { sum: 0, count: 0 },
      sleepQuality: { sum: 0, count: 0 },
      sleepDuration: { sum: 0, count: 0 },
      activityLevel: { sum: 0, count: 0 },
      overallRecovery: { sum: 0, count: 0 },
    };

    players.forEach(player => {
      const healthScore = player.healthScore || 0;
      totalHealthScore += healthScore;

      if (healthScore < 60) {
        atRiskCount++;
      }

      // Count statuses
      const status = player.status || 'Healthy';
      if (status === 'Healthy') statusCounts.healthy++;
      else if (status === 'Injured') statusCounts.injured++;
      else if (status === 'Suspended') statusCounts.suspended++;

      // Aggregate metrics (normalize to 0-100 scale)
      const metrics = player.healthMetrics || {};
      
      // Resting Heart Rate - normalize (typical range 40-100 bpm, lower is better for athletes)
      if (metrics.restingHeartRate?.value !== null && metrics.restingHeartRate?.value !== undefined) {
        const value = metrics.restingHeartRate.value;
        // Normalize: 40 bpm = 100, 100 bpm = 0 (inverted since lower is better)
        const normalized = Math.max(0, Math.min(100, ((100 - value) / 60) * 100));
        metricSums.restingHeartRate.sum += normalized;
        metricSums.restingHeartRate.count++;
      }

      // Heart Rate Variability - normalize (typical range 20-100 ms, higher is better)
      if (metrics.heartRateVariability?.value !== null && metrics.heartRateVariability?.value !== undefined) {
        const value = metrics.heartRateVariability.value;
        // Normalize: 20 ms = 0, 100 ms = 100
        const normalized = Math.max(0, Math.min(100, ((value - 20) / 80) * 100));
        metricSums.heartRateVariability.sum += normalized;
        metricSums.heartRateVariability.count++;
      }

      // Heart Rate Recovery - normalize (typical range 10-50 bpm, higher is better)
      if (metrics.heartRateRecovery?.value !== null && metrics.heartRateRecovery?.value !== undefined) {
        const value = metrics.heartRateRecovery.value;
        // Normalize: 10 bpm = 0, 50 bpm = 100
        const normalized = Math.max(0, Math.min(100, ((value - 10) / 40) * 100));
        metricSums.heartRateRecovery.sum += normalized;
        metricSums.heartRateRecovery.count++;
      }

      // Sleep Quality Score - already 0-100
      if (metrics.sleepQuality?.qualityScore !== null && metrics.sleepQuality?.qualityScore !== undefined) {
        metricSums.sleepQuality.sum += metrics.sleepQuality.qualityScore;
        metricSums.sleepQuality.count++;
      }

      // Sleep Duration - normalize (typical range 4-10 hours, 7-9 is optimal)
      if (metrics.sleepQuality?.hours !== null && metrics.sleepQuality?.hours !== undefined) {
        const hours = metrics.sleepQuality.hours;
        // Normalize: 4 hours = 0, 7-9 hours = 100, 10 hours = 80
        let normalized = 0;
        if (hours >= 7 && hours <= 9) {
          normalized = 100;
        } else if (hours < 7) {
          normalized = ((hours - 4) / 3) * 100;
        } else {
          normalized = 100 - ((hours - 9) * 20);
        }
        normalized = Math.max(0, Math.min(100, normalized));
        metricSums.sleepDuration.sum += normalized;
        metricSums.sleepDuration.count++;
      }

      // Activity Level - normalize steps (typical range 0-15000 steps, higher is better)
      if (metrics.activityLevel?.steps !== null && metrics.activityLevel?.steps !== undefined) {
        const steps = metrics.activityLevel.steps;
        // Normalize: 0 steps = 0, 10000+ steps = 100
        const normalized = Math.max(0, Math.min(100, (steps / 10000) * 100));
        metricSums.activityLevel.sum += normalized;
        metricSums.activityLevel.count++;
      }

      // Overall Recovery - use health score as proxy
      metricSums.overallRecovery.sum += healthScore;
      metricSums.overallRecovery.count++;
    });

    // Calculate averages
    const avgPerformance = totalAthletes > 0 ? Math.round(totalHealthScore / totalAthletes) : 0;

    // Build bar chart data (only include metrics with data)
    const barChartData = [
      {
        value: metricSums.restingHeartRate.count > 0 
          ? Math.round(metricSums.restingHeartRate.sum / metricSums.restingHeartRate.count) 
          : 0,
        label: 'M1',
        metricName: 'Resting\nHeart Rate',
      },
      {
        value: metricSums.heartRateVariability.count > 0 
          ? Math.round(metricSums.heartRateVariability.sum / metricSums.heartRateVariability.count) 
          : 0,
        label: 'M2',
        metricName: 'Heart Rate\nVariability',
      },
      {
        value: metricSums.heartRateRecovery.count > 0 
          ? Math.round(metricSums.heartRateRecovery.sum / metricSums.heartRateRecovery.count) 
          : 0,
        label: 'M3',
        metricName: 'Heart Rate\nRecovery',
      },
      {
        value: metricSums.sleepQuality.count > 0 
          ? Math.round(metricSums.sleepQuality.sum / metricSums.sleepQuality.count) 
          : 0,
        label: 'M4',
        metricName: 'Sleep\nQuality',
      },
      {
        value: metricSums.sleepDuration.count > 0 
          ? Math.round(metricSums.sleepDuration.sum / metricSums.sleepDuration.count) 
          : 0,
        label: 'M5',
        metricName: 'Sleep\nDuration',
      },
      {
        value: metricSums.activityLevel.count > 0 
          ? Math.round(metricSums.activityLevel.sum / metricSums.activityLevel.count) 
          : 0,
        label: 'M6',
        metricName: 'Activity\nLevel',
      },
      {
        value: metricSums.overallRecovery.count > 0 
          ? Math.round(metricSums.overallRecovery.sum / metricSums.overallRecovery.count) 
          : 0,
        label: 'M7',
        metricName: 'Overall\nRecovery',
      },
    ];

    // Calculate team average from bar chart
    const validMetrics = barChartData.filter(m => m.value > 0);
    const teamAverage = validMetrics.length > 0
      ? Math.round(validMetrics.reduce((sum, m) => sum + m.value, 0) / validMetrics.length)
      : avgPerformance; // Fallback to health score average

    // Previous period data - not available yet, set to null
    const previousAverage = null;
    const averageChange = 0; // No historical data to compare

    return {
      totalAthletes,
      avgPerformance,
      atRiskCount,
      teamAverage,
      previousAverage,
      averageChange,
      barChartData,
      statusDistribution: statusCounts,
    };
  }
}

module.exports = new HealthDataTransformService();
