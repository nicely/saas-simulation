<!-- 
Excel-like interface in Vue 3 using Composition API
Import and use this component in your main App.vue or similar entry point.
-->

<template>
  <div>
    <!-- STEP 3: Main Content - Two-column layout -->
    <div class="two-column-layout">
      <!-- Left Column: General Settings and Plan Information -->
      <div class="left-column">
        <!-- MRR Goal and Growth Rates Section -->
        <h3>General Settings</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th colspan="2">Basic Settings</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Currency</td>
              <td>
                <select v-model="selectedCurrency">
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>MRR Goal</td>
              <td>
                <input type="number" v-model.number="mrrGoal" title="Your target Monthly Recurring Revenue goal" />
              </td>
            </tr>
            <tr>
              <td>Current Month</td>
              <td>
                <select v-model="currentMonth" :title="`Current month (projection will start from next month)`">
                  <option v-for="(month, index) in monthNames" :key="index" :value="index">
                    {{ month }}
                  </option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Current Month Visitors</td>
              <td>
                <input type="number" v-model.number="initialVisitors" title="Current month's number of visitors" />
              </td>
            </tr>
            <tr>
              <td>Projection Months</td>
              <td>
                <input type="number" v-model.number="maxProjectionMonths" min="1" max="60" title="Number of months to include in the projection" />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Plans Table - Moving back to left column -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; margin-top: 15px;">
          <h3 style="margin: 0;">Plan Information</h3>
          <a href="#" @click.prevent="addPlan" style="text-decoration: underline; color: blue; font-size: 14px;">+ Add Plan</a>
        </div>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Cust.</th>
              <th>Price</th>
              <th>Churn %</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(plan, idx) in breakdownPlans" :key="idx">
              <td>
                <!-- Plan Name -->
                <input type="text" v-model="plan.name" class="plan-name-input" />
              </td>
              <td>
                <!-- Number of Customers -->
                <input 
                  type="number" 
                  v-model.number="plan.customers"
                  title="Current number of customers subscribed to this plan"
                  class="small-input"
                />
              </td>
              <td>
                <!-- Price (not MRR) -->
                <input 
                  type="number" 
                  v-model.number="plan.price"
                  title="Monthly price of this subscription plan"
                  class="small-input"
                />
              </td>
              <td>
                <!-- Churn Rate -->
                <input 
                  type="number" 
                  v-model.number="plan.churnRate"
                  step="0.01"
                  title="Monthly churn rate percentage for this plan"
                  class="small-input"
                />
              </td>
              <td>
                <a href="#" @click.prevent="removePlan(idx)" style="text-decoration: underline; color: blue; font-size: 12px;">remove</a>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Plan Distribution Table -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; margin-top: 15px;">
          <h3 style="margin: 0;">Plan Distribution</h3>
          <label style="font-weight: normal; font-size: 14px;">
            <input type="checkbox" v-model="showPlanDistribution" /> Show distribution details
          </label>
        </div>
        <table v-if="showPlanDistribution" border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Plan</th>
              <th title="Percentage of total customers on this plan">Customer Dist. (%)</th>
              <th title="Percentage of total MRR from this plan">Revenue Dist. (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(plan, idx) in breakdownPlans" :key="idx">
              <td>{{ plan.name }}</td>
              <td>{{ getCustomerDistribution(plan) }}%</td>
              <td>{{ getRevenueDistribution(plan) }}%</td>
            </tr>
          </tbody>
        </table>

        <br />

        <!-- Growth and Conversion Rates Table -->
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th colspan="3">Growth & Conversion Rates</th>
            </tr>
            <tr>
              <th>Metric</th>
              <th>Base (%)</th>
              <th>Factor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Average Visitor Growth Rate</td>
              <td>
                <input type="number" v-model.number="averageVisitorGrowthRate" step="0.01" title="Month-over-month percentage growth in website visitors" />
              </td>
              <td>
                <input type="number" v-model.number="visitorGrowthFactor" step="0.01" min="0.5" max="20" title="Growth multiplier (1 = constant)" class="factor-input" />
              </td>
            </tr>
            <tr>
              <td>Median Churn Rate</td>
              <td>
                <input type="number" :value="medianChurnRate" disabled title="Median churn rate calculated from all plan-specific churn rates" />
              </td>
              <td>
                <input type="number" v-model.number="churnRateFactor" step="0.01" min="0.5" max="2" title="Churn multiplier (1 = constant)" class="factor-input" />
              </td>
            </tr>
            <tr>
              <td>Visitor-to-Install Conversion Rate</td>
              <td>
                <input type="number" v-model.number="visitorToInstallRate" step="0.01" title="Percentage of website visitors who install the app" />
              </td>
              <td>
                <input type="number" v-model.number="visitorToInstallFactor" step="0.01" min="0.5" max="2" title="V2I multiplier (1 = constant)" class="factor-input" />
              </td>
            </tr>
            <tr>
              <td>Install-to-Sub Conversion Rate</td>
              <td>
                <input type="number" v-model.number="installToSubRate" step="0.01" title="Percentage of app installers who become paid subscribers" />
              </td>
              <td>
                <input type="number" v-model.number="installToSubFactor" step="0.01" min="0.5" max="2" title="I2S multiplier (1 = constant)" class="factor-input" />
              </td>
            </tr>
            <tr>
              <td>Visitor-to-Sub Conversion Rate</td>
              <td colspan="2" title="Calculated as: Visitor-to-Install × Install-to-Sub ÷ 100">
                {{ calculatedVisitorToSubRate }} (base rate)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Right Column: Projection Table -->
      <div class="right-column">
        <!-- Projection Table with title showing start month -->
        <h3>Projection Analysis</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th :colspan="showRateDetails ? 9 : 6">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>{{ maxProjectionMonths }}-Month Projection (Starting from {{ monthNames[(currentMonth + 1) % 12] }})</span>
                  <label style="font-weight: normal; font-size: 14px;">
                    <input type="checkbox" v-model="showRateDetails" /> Show rate details
                  </label>
                </div>
              </th>
            </tr>
            <tr>
              <th>Month</th>
              <th title="Projected website visitors per month with applied growth rate">Visitors</th>
              <th v-if="showRateDetails" title="Growth rate applied for this month">Growth Rate (%)</th>
              <th title="New subscribers gained based on conversion rate applied to monthly visitors">Subscribers Gained</th>
              <th v-if="showRateDetails" title="Conversion rate applied for this month">Conv. Rate (%)</th>
              <th title="Subscribers lost based on churn rate applied to previous month's customer base">Churned Customers</th>
              <th v-if="showRateDetails" title="Churn rate applied for this month">Churn Rate (%)</th>
              <th title="Total customers at end of month: previous month + new subscribers - churn">Net Customers (End of Month)</th>
              <th title="Projected revenue: Net customers × average price per customer">Projected MRR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(month, mIdx) in predictionMonths" :key="mIdx">
              <td>{{ month.name }}</td>
              <td :title="`Calculated with month ${mIdx+1} growth rate: ${(averageVisitorGrowthRate * Math.pow(visitorGrowthFactor, mIdx)).toFixed(2)}%`">
                {{ getVisitorsForMonth(month.projectionIndex) }}
              </td>
              <td v-if="showRateDetails">
                {{ getMonthlyGrowthRate(month.projectionIndex).toFixed(2) }}%
              </td>
              <td :title="getPlanDistributionTooltip(month.projectionIndex)">
                {{ getSubscribersForMonth(month.projectionIndex) }}
              </td>
              <td v-if="showRateDetails">
                {{ getVisitorToSubRateForMonth(month.projectionIndex).toFixed(2) }}%
              </td>
              <td :title="`Calculated as: Previous month customers × ${getChurnRateForMonth(month.projectionIndex).toFixed(2)}% churn rate`">
                {{ getChurnForMonth(month.projectionIndex) }}
              </td>
              <td v-if="showRateDetails">
                {{ getChurnRateForMonth(month.projectionIndex).toFixed(2) }}%
              </td>
              <td title="Previous month + New subscribers - Churn">
                {{ getNetCustomersForMonth(month.projectionIndex) }}
              </td>
              <td :title="`Net customers × ${selectedCurrency}${averagePricePerCustomer.toFixed(2)} average price`">
                {{ selectedCurrency }}{{ getProjectedMRRForMonth(month.projectionIndex) }}
              </td>
            </tr>
            <!-- Add a summary row at the bottom -->
            <tr class="summary-row">
              <td><strong>Total</strong></td>
              <td title="Sum of all projected visitors across 12 months"><strong>{{ getTotalVisitors() }}</strong></td>
              <td v-if="showRateDetails"></td>
              <td :title="getTotalPlanDistributionTooltip()"><strong>{{ getTotalSubscribersGained() }}</strong></td>
              <td v-if="showRateDetails"></td>
              <td title="Sum of all churned customers across 12 months"><strong>{{ getTotalChurnedCustomers() }}</strong></td>
              <td v-if="showRateDetails"></td>
              <td><!-- No total for Net Customers as it's end-of-month --></td>
              <td title="Projected MRR at the end of the 12-month period"><strong>{{ selectedCurrency }}{{ getLastMonthMRR() }}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- Add MRR Goal Summary as a separate section -->
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th colspan="2">Target MRR Analysis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Current MRR ({{ monthNames[currentMonth] }})</td>
              <td>{{ selectedCurrency }}{{ totalMRR }}</td>
            </tr>
            <tr>
              <td>Projected MRR ({{ monthNames[(currentMonth + maxProjectionMonths) % 12] }})</td>
              <td>{{ selectedCurrency }}{{ getLastMonthMRR() }}</td>
            </tr>
            <tr>
              <td>MRR Goal</td>
              <td>{{ selectedCurrency }}{{ mrrGoal }}</td>
            </tr>
            <tr>
              <td>Difference from Goal</td>
              <td :class="{ 'positive': isGoalReached(), 'negative': !isGoalReached() }">
                {{ getMrrGoalSummary() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * STEP 0: Define all your state (reactive variables) and logic here in the <script setup> block.
 */

// MRR Goal and Growth Rate values
const mrrGoal = ref(15802);
const initialVisitors = ref(1000); // Added initial visitors count
const averageVisitorGrowthRate = ref(-2.66); // example from screenshot
const visitorToInstallRate = ref(2.7);
const installToSubRate = ref(24);
const selectedCurrency = ref('$'); // Default currency is USD
const maxProjectionMonths = ref(12); // Default projection period
const showRateDetails = ref(false); // Toggle for showing rate details in projection table
const showPlanDistribution = ref(false); // Toggle for showing plan distribution table

// Growth factors for rates (1.0 means no change month to month)
const visitorGrowthFactor = ref(1.0);
const churnRateFactor = ref(1.0);
const visitorToInstallFactor = ref(1.05); // 5% improvement each month
const installToSubFactor = ref(1.02); // 2% improvement each month

// Month data
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonth = ref(new Date().getMonth()); // Default to current month

// Breakdown Data - Updated to use price instead of mrr
const breakdownPlans = ref([
  {
    name: 'Starter',
    customers: 30,
    price: 49,
    churnRate: 2.5,
  },
  {
    name: 'Essentials',
    customers: 7,
    price: 99,
    churnRate: 1.8,
  },
  {
    name: 'Scale',
    customers: 5,
    price: 199,
    churnRate: 1.5,
  },
  {
    name: 'Prime',
    customers: 2,
    price: 299,
    churnRate: 1.0,
  },
]);

// Add/Remove plans
function addPlan() {
  breakdownPlans.value.push({
    name: 'New Plan',
    customers: 0,
    price: 0,
    churnRate: 2.0,
  });
}

function removePlan(idx) {
  breakdownPlans.value.splice(idx, 1);
}

// Computed total MRR (calculated from price * customers)
const totalMRR = computed(() => {
  return breakdownPlans.value.reduce((sum, plan) => sum + (plan.price * plan.customers), 0);
});

// Calculate average price per customer based on current plans
const averagePricePerCustomer = computed(() => {
  const totalCustomers = breakdownPlans.value.reduce((sum, plan) => sum + plan.customers, 0);
  if (totalCustomers === 0) return 0;
  return totalMRR.value / totalCustomers;
});

// Predictions
const predictionMonths = computed(() => {
  const months = [];
  
  // Generate months starting from the NEXT month after currentMonth
  for (let i = 0; i < maxProjectionMonths.value; i++) {
    const monthIndex = (currentMonth.value + i + 1) % 12; // +1 to start from next month
    months.push({
      name: monthNames[monthIndex],
      index: monthIndex,
      projectionIndex: i // This is the index used for calculations (0-11)
    });
  }
  
  return months;
});

// Calculate visitor-to-sub conversion rate based on the other two rates
const calculatedVisitorToSubRate = computed(() => {
  return ((visitorToInstallRate.value * installToSubRate.value) / 100).toFixed(2);
});

// Calculate median churn rate from all plans
const medianChurnRate = computed(() => {
  const rates = breakdownPlans.value.map(plan => plan.churnRate).filter(rate => rate !== undefined);
  
  if (rates.length === 0) return 0;
  
  // Sort the rates
  rates.sort((a, b) => a - b);
  
  // Find the median
  const middle = Math.floor(rates.length / 2);
  
  if (rates.length % 2 === 0) {
    // Even number of rates, average the two middle values
    return ((rates[middle - 1] + rates[middle]) / 2).toFixed(2);
  } else {
    // Odd number of rates, return the middle value
    return rates[middle].toFixed(2);
  }
});

// Helper function to get growth rate for a specific month
function getMonthlyGrowthRate(monthIndex) {
  // Base rate from initial setting
  const baseRate = averageVisitorGrowthRate.value;
  
  // First month (index 0) always uses the base rate
  if (monthIndex === 0) {
    return baseRate;
  }
  
  // For negative base rates with factor > 1, gradually move toward positive growth
  if (baseRate < 0 && visitorGrowthFactor.value > 1) {
    // Calculate maximum possible growth rate based on factor
    // Higher factors allow higher maximum positive growth
    const maxGrowthRate = Math.min(visitorGrowthFactor.value * 10, 100); // Allow up to 100% at maximum
    
    // For large factors (>5), increase the improvement scale more aggressively
    let improvementScale;
    if (visitorGrowthFactor.value > 5) {
      improvementScale = visitorGrowthFactor.value * 0.4; // Much more aggressive for high factors
    } else {
      improvementScale = visitorGrowthFactor.value * 0.3; // Still faster than before
    }
    
    // Calculate improvement amount with the new scale
    const improvementAmount = Math.abs(baseRate) * improvementScale * 0.1 * monthIndex;
    
    // Calculate new rate with faster improvement for higher factors
    let newRate = baseRate + improvementAmount;
    
    // Cap at the calculated maximum growth rate
    return Math.min(newRate, maxGrowthRate);
  }
  
  // For negative base rates with factor < 1, growth gets worse (more negative)
  else if (baseRate < 0 && visitorGrowthFactor.value < 1) {
    // Calculate how much more negative the rate gets each month
    const worseningAmount = Math.abs(baseRate) * (1 - visitorGrowthFactor.value) * 0.2;
    
    // Calculate the new rate for this month, making it more negative
    let newRate = baseRate - (worseningAmount * monthIndex);
    
    // Prevent extremely negative growth (e.g., -30%)
    return Math.max(newRate, -30);
  }
  
  // For positive base rates, use traditional exponential growth/decline
  else if (baseRate > 0) {
    let rate = baseRate;
    for (let i = 0; i < monthIndex; i++) {
      rate *= visitorGrowthFactor.value;
    }
    
    // Cap maximum positive growth at a reasonable value
    return Math.min(rate, 100);
  }
  
  // If base rate is exactly 0 or factor is exactly 1, rate stays the same
  return baseRate;
}

// Update the getVisitorsForMonth function to ensure visitors never go negative
function getVisitorsForMonth(monthIndex) {
  // Initial visitors represents the previous month (before projection starts)
  let visitors = initialVisitors.value;
  
  // Apply growth rate for each month including the first projection month
  for (let i = 0; i <= monthIndex; i++) {
    // Get the growth rate for this specific month
    const monthlyRate = getMonthlyGrowthRate(i);
    visitors *= (1 + (monthlyRate / 100));
    
    // Ensure we never have negative visitors (minimum 1)
    visitors = Math.max(visitors, 1);
  }
  
  return Math.round(visitors).toFixed(0);
}

function getVisitorToInstallRateForMonth(monthIndex) {
  let rate = visitorToInstallRate.value;
  for (let i = 0; i < monthIndex; i++) {
    rate *= visitorToInstallFactor.value;
  }
  // Cap at 100%
  return Math.min(rate, 100);
}

function getInstallToSubRateForMonth(monthIndex) {
  let rate = installToSubRate.value;
  for (let i = 0; i < monthIndex; i++) {
    rate *= installToSubFactor.value;
  }
  // Cap at 100%
  return Math.min(rate, 100);
}

function getVisitorToSubRateForMonth(monthIndex) {
  const vtir = getVisitorToInstallRateForMonth(monthIndex);
  const itsr = getInstallToSubRateForMonth(monthIndex);
  return (vtir * itsr) / 100;
}

function getChurnRateForMonth(monthIndex) {
  let rate = parseFloat(medianChurnRate.value);
  for (let i = 0; i < monthIndex; i++) {
    rate *= churnRateFactor.value;
  }
  return rate;
}

function getSubscribersForMonth(monthIndex) {
  // Use our calculated visitor-to-sub conversion rate for this specific month
  const visitors = parseInt(getVisitorsForMonth(monthIndex));
  return Math.floor(visitors * (getVisitorToSubRateForMonth(monthIndex) / 100));
}

function getChurnForMonth(monthIndex) {
  if (monthIndex === 0) {
    // First month in the projection - apply churn to current customer base
    // Current customers represent the "previous month" before projection starts
    const currentCustomers = breakdownPlans.value.reduce((sum, plan) => sum + plan.customers, 0);
    return Math.floor(currentCustomers * (getChurnRateForMonth(0) / 100));
  } else {
    // Apply churn to the previous month's end-of-month customer count
    const prevMonthNetCustomers = getNetCustomersForMonth(monthIndex - 1);
    return Math.floor(prevMonthNetCustomers * (getChurnRateForMonth(monthIndex) / 100));
  }
}

function getNetCustomersForMonth(monthIndex) {
  if (monthIndex < 0) {
    // Return current total customers - this represents the "previous month"
    return breakdownPlans.value.reduce((sum, plan) => sum + plan.customers, 0);
  }
  
  // For the first month in projection
  if (monthIndex === 0) {
    const currentCustomers = breakdownPlans.value.reduce((sum, plan) => sum + plan.customers, 0);
    const churned = getChurnForMonth(0);
    const newSubscribers = getSubscribersForMonth(0);
    
    // Apply churn to existing customers first, then add new subscribers
    return currentCustomers - churned + newSubscribers;
  }
  
  // For subsequent months
  // First subtract churn from previous month's customers, then add new subscribers
  const prevMonthCustomers = getNetCustomersForMonth(monthIndex - 1);
  const churned = getChurnForMonth(monthIndex);
  const newSubscribers = getSubscribersForMonth(monthIndex);
  
  return prevMonthCustomers - churned + newSubscribers;
}

// New function to calculate projected MRR for each month
function getProjectedMRRForMonth(monthIndex) {
  const netCustomers = getNetCustomersForMonth(monthIndex);
  // Use the average price per customer to calculate projected MRR
  return (netCustomers * averagePricePerCustomer.value).toFixed(2);
}

// Add functions to calculate totals for the summary row
function getTotalVisitors() {
  let total = 0;
  for (let i = 0; i < maxProjectionMonths.value; i++) {
    total += parseInt(getVisitorsForMonth(i));
  }
  return total.toLocaleString();
}

function getTotalSubscribersGained() {
  let total = 0;
  for (let i = 0; i < maxProjectionMonths.value; i++) {
    total += getSubscribersForMonth(i);
  }
  return total;
}

function getTotalChurnedCustomers() {
  let total = 0;
  for (let i = 0; i < maxProjectionMonths.value; i++) {
    total += getChurnForMonth(i);
  }
  return total;
}

function getLastMonthMRR() {
  // Return projected MRR for the last month in the projection
  return getProjectedMRRForMonth(maxProjectionMonths.value - 1);
}

// MRR Goal comparison functions
function isGoalReached() {
  return parseFloat(getLastMonthMRR()) >= mrrGoal.value;
}

function getMrrGoalSummary() {
  const lastMonthMRR = parseFloat(getLastMonthMRR());
  const difference = lastMonthMRR - mrrGoal.value;
  const prefix = difference >= 0 ? '+' : '';
  return `${prefix}${selectedCurrency.value}${difference.toFixed(2)} (${prefix}${(difference / mrrGoal.value * 100).toFixed(1)}%)`;
}

// Function to calculate customer distribution percentage
function getCustomerDistribution(plan) {
  const totalCustomers = breakdownPlans.value.reduce((sum, p) => sum + p.customers, 0);
  if (totalCustomers === 0) return 0;
  return ((plan.customers / totalCustomers) * 100).toFixed(1);
}

// Function to calculate revenue distribution percentage
function getRevenueDistribution(plan) {
  if (totalMRR.value === 0) return 0;
  const planMRR = plan.price * plan.customers;
  return ((planMRR / totalMRR.value) * 100).toFixed(1);
}

// Function to generate tooltip showing plan distribution for new subscribers
function getPlanDistributionTooltip(monthIndex) {
  const newSubscribers = getSubscribersForMonth(monthIndex);
  let tooltipText = `New subscribers: ${newSubscribers}\n\nPlan distribution:`;
  
  // Calculate the distribution of new subscribers based on existing plan distribution
  breakdownPlans.value.forEach(plan => {
    const distribution = parseFloat(getCustomerDistribution(plan));
    const subscribersForPlan = Math.round((distribution / 100) * newSubscribers);
    tooltipText += `\n${plan.name}: ${subscribersForPlan} (${distribution}%)`;
  });
  
  return tooltipText;
}

// Function to generate tooltip for total subscribers gained row
function getTotalPlanDistributionTooltip() {
  const totalNewSubscribers = getTotalSubscribersGained();
  let tooltipText = `Total subscribers gained: ${totalNewSubscribers}\n\nPlan distribution:`;
  
  // Calculate the distribution of total new subscribers based on existing plan distribution
  breakdownPlans.value.forEach(plan => {
    const distribution = parseFloat(getCustomerDistribution(plan));
    const totalSubscribersForPlan = Math.round((distribution / 100) * totalNewSubscribers);
    tooltipText += `\n${plan.name}: ${totalSubscribersForPlan} (${distribution}%)`;
  });
  
  return tooltipText;
}
</script>

<style scoped>
/* Minimal styling so everything looks like a basic table. Adjust as needed. */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th, td {
  text-align: left;
}

h3, h4 {
  text-align: left;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 16px;
}

input {
  width: 100px;
}

/* Two-column layout styles */
.two-column-layout {
  display: flex;
  gap: 20px;
}

.left-column {
  flex: 1;
  max-width: 40%;
}

.right-column {
  flex: 2;
  max-width: 60%;
}

/* Add styles for the summary row */
.summary-row {
  background-color: #f5f5f5;
  font-weight: bold;
}

.summary-row td {
  border-top: 2px solid #333;
}

/* Colors for positive/negative values */
.positive {
  color: #28a745;
  font-weight: bold;
}

.negative {
  color: #dc3545;
  font-weight: bold;
}

/* Added CSS for factor-input class */
.factor-input {
  width: 80px;
}

/* Show question mark cursor on hover for elements with title attribute */
[title] {
  cursor: help;
}

/* Add styles for smaller inputs in the plan information table */
.small-input {
  width: 55px;
}

.plan-name-input {
  width: 80px;
}
</style> 