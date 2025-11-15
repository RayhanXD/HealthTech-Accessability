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
   */
  async getAccountToken() {
    // Return cached token if still valid
    if (this.accountToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accountToken;
    }

    // Try multiple authentication strategies based on OpenAPI spec
    const authStrategies = [
      // Strategy 1: Standard approach with X-Environment header (per OpenAPI spec)
      {
        endpoint: `${this.authBaseURL}/api/v1/oauth/account/token`,
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': this.environment
        },
        description: 'Standard with X-Environment header'
      },
      // Strategy 2: Try with capitalized environment
      {
        endpoint: `${this.authBaseURL}/api/v1/oauth/account/token`,
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': this.environment.charAt(0).toUpperCase() + this.environment.slice(1)
        },
        description: 'With capitalized X-Environment header'
      },
      // Strategy 3: Try without X-Environment (though spec says it's required)
      {
        endpoint: `${this.authBaseURL}/api/v1/oauth/account/token`,
        headers: {
          'Content-Type': 'application/json'
        },
        description: 'Without X-Environment header'
      },
      // Strategy 4: Try production environment (in case credentials are production)
      {
        endpoint: `${this.authBaseURL}/api/v1/oauth/account/token`,
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': 'production'
        },
        description: 'Trying production environment'
      }
    ];

    for (let i = 0; i < authStrategies.length; i++) {
      const strategy = authStrategies[i];
      try {
        console.log(`\n🔄 Attempting authentication (Strategy ${i + 1}): ${strategy.description}`);
        console.log(`   Endpoint: ${strategy.endpoint}`);
        console.log(`   Headers:`, JSON.stringify(strategy.headers, null, 2));
        console.log(`   Request Body:`, JSON.stringify({
          clientId: this.clientId ? `${this.clientId.substring(0, 10)}...` : 'Missing',
          clientSecret: this.clientSecret ? '***hidden***' : 'Missing'
        }, null, 2));
        
        const requestBody = {
          clientId: this.clientId,
          clientSecret: this.clientSecret
        };

        const response = await axios.post(
          strategy.endpoint,
          requestBody,
          {
            headers: strategy.headers,
            validateStatus: function (status) {
              return status < 500; // Don't throw for 4xx errors, only 5xx
            }
          }
        );

        // Check if we got a successful response
        if (response.status === 200 && response.data) {
          // Response uses accountToken per OpenAPI spec (RetrieveClientTokenCommandResult)
          this.accountToken = response.data.accountToken;
          
          if (!this.accountToken) {
            console.error(`❌ Strategy ${i + 1} failed: No accountToken in response`);
            console.error('Response data:', JSON.stringify(response.data, null, 2));
            continue; // Try next strategy
          }
          
          // Set expiry (typically tokens expire in 1 hour, subtracting 5 minutes for safety)
          // If no expiry info provided, default to 55 minutes
          const expiresIn = response.data.expires_in || response.data.expiresIn || 3300;
          this.tokenExpiry = Date.now() + (expiresIn * 1000);
          
          console.log('✅ Authentication successful!');
          console.log(`   Token type: ${response.data.tokenType || 'unknown'}`);
          console.log(`   Token (first 20 chars): ${this.accountToken.substring(0, 20)}...`);
          return this.accountToken;
        } else {
          // Got a response but it's not 200
          console.error(`❌ Strategy ${i + 1} failed: Status ${response.status}`);
          console.error('Response data:', JSON.stringify(response.data, null, 2));
          
          // If it's a 400, the credentials or headers are wrong - try next strategy
          // If it's still 500, might be a server issue
          if (response.status === 500 && i < authStrategies.length - 1) {
            continue; // Try next strategy
          } else if (response.status === 400) {
            continue; // Try next strategy
          } else {
            throw new Error(`Authentication failed with status ${response.status}: ${JSON.stringify(response.data)}`);
          }
        }
      } catch (error) {
        const status = error.response?.status;
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
        
        console.error(`❌ Strategy ${i + 1} failed: ${status || 'No status'} - ${errorMsg}`);
        
        // If this is the last strategy, throw the error
        if (i === authStrategies.length - 1) {
          console.error('\n❌ All authentication strategies failed');
          console.error('Auth Base URL:', this.authBaseURL);
          console.error('Data Base URL:', this.dataBaseURL);
          console.error('Environment:', this.environment);
          console.error('Client ID:', this.clientId ? `${this.clientId.substring(0, 10)}...` : 'Missing');
          console.error('Client Secret:', this.clientSecret ? 'Set (hidden)' : 'Missing');
          
          if (error.response) {
            console.error('Final Status Code:', error.response.status);
            console.error('Final Response Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Final Response Headers:', JSON.stringify(error.response.headers, null, 2));
          } else if (error.request) {
            console.error('No response received. Request config:', {
              url: error.config?.url,
              method: error.config?.method,
              headers: error.config?.headers
            });
          }
          
          const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
          throw new Error(`Failed to authenticate with Sahha API: ${errorMessage} (Status: ${error.response?.status || 'No response'})`);
        }
        // Otherwise, continue to next strategy
      }
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
            'Authorization': `account ${token}`, // Per OpenAPI spec: account tokens use "account {token}" not "Bearer {token}"
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

