#!/usr/bin/env node
const http = require('http');

// First, let's get a valid token by "logging in"
async function testAPI() {
  try {
    // Login
    console.log('1. Testing login endpoint...');
    const loginData = JSON.stringify({
      dsmCode: 'bhalchandrard',
      password: 'Bhalchandra@74',
      role: 'ADMIN'
    });

    const loginReq = http.request('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.token) {
            console.log('✓ Login successful');
            const token = json.token;
            
            // Now test dashboard API
            console.log('\n2. Testing analytics dashboard API...');
            const today = new Date().toISOString().split('T')[0];
            const dashReq = http.request(
              `http://localhost:4000/api/analytics/dashboard?from=${today}&to=${today}`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              },
              (res) => {
                let dashData = '';
                res.on('data', chunk => dashData += chunk);
                res.on('end', () => {
                  try {
                    const dashJson = JSON.parse(dashData);
                    console.log('✓ Dashboard API successful');
                    console.log('\nResponse keys:', Object.keys(dashJson).sort());
                    console.log('\nKPIs:', dashJson.kpis ? Object.keys(dashJson.kpis).sort() : 'N/A');
                    
                    // Check for new fields
                    if (dashJson.sparklines) {
                      console.log('\n✓ sparklines field present:');
                      console.log('  - totalSales entries:', dashJson.sparklines.totalSales?.length || 0);
                      console.log('  - totalCollected entries:', dashJson.sparklines.totalCollected?.length || 0);
                    }
                    if (dashJson.heatmap) {
                      console.log('✓ heatmap field present:');
                      console.log('  - shifts:', dashJson.heatmap.length);
                      if (dashJson.heatmap[0]) {
                        console.log('  - points per shift:', dashJson.heatmap[0].points?.length || 0);
                      }
                    }
                    
                    // Show KPI details
                    if (dashJson.kpis) {
                      console.log('\nKPI Details:');
                      console.log('  - totalSales:', dashJson.kpis.totalSales);
                      console.log('  - totalCollected:', dashJson.kpis.totalCollected);
                      console.log('  - difference:', dashJson.kpis.difference);
                    }
                    
                    console.log('\n✅ All API tests passed!');
                  } catch (e) {
                    console.error('✗ Failed to parse dashboard response:', e.message);
                    console.log('Raw response:', data.substring(0, 500));
                  }
                });
              }
            );
            dashReq.on('error', err => console.error('✗ Dashboard API error:', err.message));
            dashReq.end();
          } else {
            console.error('✗ Login failed:', json.message || data);
          }
        } catch (e) {
          console.error('✗ Failed to parse login response:', e.message);
        }
      });
    });

    loginReq.on('error', err => console.error('✗ Login error:', err.message));
    loginReq.end(loginData);

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

testAPI();
