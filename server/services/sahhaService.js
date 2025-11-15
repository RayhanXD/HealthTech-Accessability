const axios = require('axios');

class SahhaService {
  constructor() {
    // Data API uses sandbox-api.sahha.ai, but auth uses app.sahha.ai
    this.dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';
    this.authBaseURL = process.env.SAHHA_AUTH_BASE_URL || 'https://app.sahha.ai';
    this.clientId = process.env.SAHHA_CLIENT_ID;
    this.clientSecret = process.env.SAHHA_CLIENT_SECRET;
    this.environment = process.env.SAHHA_ENVIRONMENT || 'sandbox';
    this.accountToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get account token for authentication
   */
  async getAccountToken() {
    // Return cached token if still valid
    if (this.accountToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accountToken;
    }

    try {
      // Authentication endpoint is on app.sahha.ai, not sandbox-api.sahha.ai
      const authEndpoint = `${this.authBaseURL}/api/v1/oauth/account/token`;
      
      console.log(`Authenticating with: ${authEndpoint}`);
      
      // Use camelCase: clientId and clientSecret (as shown in OpenAPI spec)
      // X-Environment header is required per the API documentation
      const response = await axios.post(
        authEndpoint,
        {
          clientId: this.clientId,
          clientSecret: this.clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'X-Environment': this.environment
          }
        }
      );

      // Response uses accountToken per OpenAPI spec
      this.accountToken = response.data.accountToken;
      
      if (!this.accountToken) {
        throw new Error('No accountToken received in response');
      }
      
      // Set expiry (typically tokens expire in 1 hour, subtracting 5 minutes for safety)
      // If no expiry info provided, default to 55 minutes
      const expiresIn = response.data.expires_in || response.data.expiresIn || 3300;
      this.tokenExpiry = Date.now() + (expiresIn * 1000);
      
      console.log('✅ Authentication successful!');
      return this.accountToken;
    } catch (error) {
      console.error('❌ Error getting Sahha account token:');
      console.error('Auth Base URL:', this.authBaseURL);
      console.error('Endpoint:', `${this.authBaseURL}/api/v1/oauth/account/token`);
      console.error('Environment:', this.environment);
      console.error('Client ID:', this.clientId ? `${this.clientId.substring(0, 10)}...` : 'Missing');
      console.error('Client Secret:', this.clientSecret ? 'Set (hidden)' : 'Missing');
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Status Code:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received. Request:', error.request);
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(`Failed to authenticate with Sahha API: ${errorMessage} (Status: ${error.response?.status || 'No response'})`);
    }
  }

  /**
   * Create a Sahha profile for a user
   */
  async createProfile(playerData) {
    try {
      const token = await this.getAccountToken();
      
      const profileData = {
        external_id: playerData.externalId || playerData._id?.toString(),
        demographic: {
          age: playerData.Age,
          sex_at_birth: playerData.SexAtBirth?.toLowerCase(),
          weight_kg: playerData.Bodyweight_in_pounds ? (playerData.Bodyweight_in_pounds * 0.453592) : null,
          height_cm: playerData.Height_in_inches ? (playerData.Height_in_inches * 2.54) : null
        }
      };

      const response = await axios.post(
        `${this.dataBaseURL}/api/v1/profiles`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Sahha profile:', error.response?.data || error.message);
      throw new Error(`Failed to create Sahha profile: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get trends for a profile
   */
  async getTrends(profileId, options = {}) {
    try {
      const token = await this.getAccountToken();
      
      const params = new URLSearchParams();
      if (options.startDate) params.append('start_date', options.startDate);
      if (options.endDate) params.append('end_date', options.endDate);
      if (options.category) params.append('category', options.category);
      
      const response = await axios.get(
        `${this.dataBaseURL}/api/v1/profiles/${profileId}/trends?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting trends:', error.response?.data || error.message);
      throw new Error(`Failed to get trends: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get comparisons for a profile
   */
  async getComparisons(profileId, options = {}) {
    try {
      const token = await this.getAccountToken();
      
      const params = new URLSearchParams();
      if (options.startDate) params.append('start_date', options.startDate);
      if (options.endDate) params.append('end_date', options.endDate);
      if (options.category) params.append('category', options.category);
      
      const response = await axios.get(
        `${this.dataBaseURL}/api/v1/profiles/${profileId}/comparisons?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting comparisons:', error.response?.data || error.message);
      throw new Error(`Failed to get comparisons: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Sync insights from Sahha (trends and comparisons)
   */
  async syncInsights(profileId, options = {}) {
    try {
      const [trendsResponse, comparisonsResponse] = await Promise.all([
        this.getTrends(profileId, options).catch(err => {
          console.error('Error fetching trends:', err);
          return { data: [] };
        }),
        this.getComparisons(profileId, options).catch(err => {
          console.error('Error fetching comparisons:', err);
          return { data: [] };
        })
      ]);

      return {
        Trends: this.transformTrends(trendsResponse.data || trendsResponse || []),
        Comparisons: this.transformComparisons(comparisonsResponse.data || comparisonsResponse || [])
      };
    } catch (error) {
      console.error('Error syncing insights:', error);
      throw error;
    }
  }

  /**
   * Transform Sahha trends to match your schema
   */
  transformTrends(sahhaTrends) {
    if (!Array.isArray(sahhaTrends)) return [];
    
    return sahhaTrends.map(trend => ({
      Category: trend.category || trend.Category || '',
      Name: trend.name || trend.Name || '',
      State: trend.state || trend.State || '',
      isHigherBetter: trend.is_higher_better !== undefined ? trend.is_higher_better : (trend.isHigherBetter !== undefined ? trend.isHigherBetter : true),
      valueRange: trend.value_range || trend.valueRange || 0,
      Unit: trend.unit || trend.Unit || '',
      trendStartTime: trend.trend_start_time || trend.trendStartTime || '',
      trendEndTime: trend.trend_end_time || trend.trendEndTime || '',
      Data: (trend.data || trend.Data || []).map(dataPoint => ({
        StartDateTime: dataPoint.start_date_time || dataPoint.StartDateTime || '',
        endDateTime: dataPoint.end_date_time || dataPoint.endDateTime || '',
        Value: dataPoint.value !== undefined ? dataPoint.value : (dataPoint.Value !== undefined ? dataPoint.Value : 0),
        percentChangeFromPrevious: dataPoint.percent_change_from_previous !== undefined ? dataPoint.percent_change_from_previous : (dataPoint.percentChangeFromPrevious !== undefined ? dataPoint.percentChangeFromPrevious : 0)
      }))
    }));
  }

  /**
   * Transform Sahha comparisons to match your schema
   */
  transformComparisons(sahhaComparisons) {
    if (!Array.isArray(sahhaComparisons)) return [];
    
    return sahhaComparisons.map(comparison => ({
      Category: comparison.category || comparison.Category || '',
      Name: comparison.name || comparison.Name || '',
      Value: comparison.value !== undefined ? comparison.value.toString() : (comparison.Value !== undefined ? comparison.Value.toString() : ''),
      Unit: comparison.unit || comparison.Unit || '',
      isHigherBetter: comparison.is_higher_better !== undefined ? comparison.is_higher_better : (comparison.isHigherBetter !== undefined ? comparison.isHigherBetter : true),
      startDateTime: comparison.start_date_time || comparison.startDateTime || '',
      endDateTime: comparison.end_date_time || comparison.endDateTime || '',
      Data: (comparison.data || comparison.Data || []).map(dataPoint => ({
        Type: dataPoint.type || dataPoint.Type || '',
        Value: dataPoint.value !== undefined ? dataPoint.value.toString() : (dataPoint.Value !== undefined ? dataPoint.Value.toString() : '')
      })),
      Percentile: comparison.percentile !== undefined ? comparison.percentile : (comparison.Percentile !== undefined ? comparison.Percentile : 0),
      Difference: comparison.difference !== undefined ? comparison.difference.toString() : (comparison.Difference !== undefined ? comparison.Difference.toString() : ''),
      percentageDifference: comparison.percentage_difference !== undefined ? comparison.percentage_difference.toString() : (comparison.percentageDifference !== undefined ? comparison.percentageDifference.toString() : ''),
      State: comparison.state || comparison.State || '',
      Properties: comparison.properties || comparison.Properties || {}
    }));
  }

  /**
   * Verify webhook signature (if Sahha provides webhook verification)
   */
  verifyWebhookSignature(payload, signature, secret) {
    // Implement webhook signature verification if Sahha provides it
    // This is a placeholder - check Sahha docs for actual implementation
    return true;
  }
}

module.exports = new SahhaService();

