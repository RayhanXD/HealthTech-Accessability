const axios = require('axios');

class SahhaService {
  constructor() {
    // Data API uses sandbox-api.sahha.ai, but auth uses app.sahha.ai
    this.dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';
    this.authBaseURL = process.env.SAHHA_AUTH_BASE_URL || 'https://app.sahha.ai';
    this.clientId = process.env.SAHHA_CLIENT_ID;
    this.clientSecret = process.env.SAHHA_CLIENT_SECRET;
    // Application credentials for user token creation (correct method per Sahha docs)
    this.appId = process.env.SAHHA_APPLICATION_ID;
    this.appSecret = process.env.SAHHA_APPLICATION_SECRET;
    this.environment = process.env.SAHHA_ENVIRONMENT || 'sandbox';
    this.accountToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get account token for authentication
   * Per Sahha docs: https://docs.sahha.ai/docs/data-flow/api
   */
  async getAccountToken() {
    // Return cached token if still valid
    if (this.accountToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accountToken;
    }

    // Use sandbox-api.sahha.ai for sandbox, api.sahha.ai for production
    // Per docs: simple POST with clientId and clientSecret, no X-Environment header needed
    const authEndpoint = this.environment === 'sandbox' 
      ? 'https://sandbox-api.sahha.ai/api/v1/oauth/account/token'
      : 'https://api.sahha.ai/api/v1/oauth/account/token';

    try {
      const response = await axios.post(
        authEndpoint,
        {
          clientId: this.clientId,
          clientSecret: this.clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 && response.data) {
        this.accountToken = response.data.accountToken;
        
        if (!this.accountToken) {
          throw new Error('No accountToken in response');
        }
        
        // Set expiry (typically tokens expire in 1 hour, subtracting 5 minutes for safety)
        const expiresIn = response.data.expires_in || response.data.expiresIn || 3300;
        this.tokenExpiry = Date.now() + (expiresIn * 1000);
        
        return this.accountToken;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.errors?.[0] || error.message;
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
        externalId: playerData.externalId || playerData._id?.toString(),
        demographic: {
          age: playerData.Age,
          sex_at_birth: playerData.SexAtBirth?.toLowerCase(),
          weight_kg: playerData.Bodyweight_in_pounds ? (playerData.Bodyweight_in_pounds * 0.453592) : null,
          height_cm: playerData.Height_in_inches ? (playerData.Height_in_inches * 2.54) : null
        }
      };

      const response = await axios.post(
        `${this.dataBaseURL}/api/v1/oauth/profile/register`,
        profileData,
        {
          headers: {
            'Authorization': `account ${token}`, // Per OpenAPI spec: account tokens use "account {token}" not "Bearer {token}"
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract profileId from JWT token if not in response
      const profileResponse = response.data;
      if (!profileResponse.id && !profileResponse.profile_id && profileResponse.profileToken) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(profileResponse.profileToken);
          profileResponse.id = decoded?.['https://api.sahha.ai/claims/profileId'] || decoded?.profileId;
        } catch (error) {
          // Ignore decode errors
        }
      }
      
      return profileResponse;
    } catch (error) {
      const errorData = error.response?.data;
      const errorDetails = errorData?.errors?.[0]?.errors?.[0] || errorData?.message || error.message;
      console.error('Error creating Sahha profile:', JSON.stringify(errorData, null, 2) || error.message);
      throw new Error(`Failed to create Sahha profile: ${errorDetails} (Status: ${error.response?.status || 'No response'})`);
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
            'Authorization': `account ${token}` // Per OpenAPI spec: account tokens use "account {token}" not "Bearer {token}"
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
            'Authorization': `account ${token}` // Per OpenAPI spec: account tokens use "account {token}" not "Bearer {token}"
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
   * Create a user token for SDK authentication
   * Uses Application ID/Secret (correct method per Sahha documentation)
   * @param {string} externalUserId - The external user ID (playerId)
   * @returns {Promise<string>} User token for SDK
   */
  async createUserToken(externalUserId) {
    if (!this.appId || !this.appSecret) {
      throw new Error('SAHHA_APPLICATION_ID and SAHHA_APPLICATION_SECRET must be set in .env');
    }

    // Try different endpoint variations
    const endpoints = [
      `${this.dataBaseURL}/api/v1/user/token`,  // With /api prefix
      `${this.dataBaseURL}/v1/user/token`,     // Without /api prefix
      `https://api.sahha.ai/v1/user/token`,    // Direct API URL
      `https://api.sahha.ai/api/v1/user/token` // Direct API URL with prefix
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await axios.post(
          endpoint,
          { external_id: externalUserId },
          {
            headers: {
              'x-app-id': this.appId,
              'x-app-secret': this.appSecret,
              'Content-Type': 'application/json'
            },
            validateStatus: () => true // Don't throw on 404
          }
        );

        if (response.status === 200 && response.data?.token) {
          return response.data.token;
        } else if (response.status !== 404) {
          // If it's not 404, this might be the right endpoint but wrong format
          console.log(`Endpoint ${endpoint} returned ${response.status}:`, response.data);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.log(`Endpoint ${endpoint} error:`, error.message);
        }
      }
    }

    // If all endpoints failed, try the last one and throw the error
    try {
      const response = await axios.post(
        `${this.dataBaseURL}/api/v1/user/token`,
        { external_id: externalUserId },
        {
          headers: {
            'x-app-id': this.appId,
            'x-app-secret': this.appSecret,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.token) {
        throw new Error('No token received from Sahha API');
      }

      return response.data.token;
    } catch (error) {
      console.error('Error creating Sahha user token:', error.response?.data || error.message);
      throw new Error(`Failed to create user token: ${error.response?.data?.message || error.message}`);
    }
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

