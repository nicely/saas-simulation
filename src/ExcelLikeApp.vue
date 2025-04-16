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
        <h3>General Settings Table</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th colspan="2">General Settings</th>
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
                <input type="number" v-model.number="mrrGoal" />
              </td>
            </tr>
            <tr>
              <td>Average Visitor Growth Rate (%)</td>
              <td>
                <input type="number" v-model.number="averageVisitorGrowthRate" step="0.01" />
              </td>
            </tr>
            <tr>
              <td>Churn Rate (%)</td>
              <td>
                <input type="number" v-model.number="churnRate" step="0.01" />
              </td>
            </tr>
          </tbody>
        </table>

        <br />

        <!-- Plans Table - Changed MRR to Price -->
        <h3>Plan Information</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Customers</th>
              <th>Price</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(plan, idx) in breakdownPlans" :key="idx">
              <td>
                <!-- Plan Name -->
                <input type="text" v-model="plan.name" />
              </td>
              <td>
                <!-- Number of Customers -->
                <input 
                  type="number" 
                  v-model.number="plan.customers" 
                />
              </td>
              <td>
                <!-- Price (not MRR) -->
                <input 
                  type="number" 
                  v-model.number="plan.price" 
                />
              </td>
              <td>
                <a href="#" @click.prevent="removePlan(idx)" style="text-decoration: underline; color: blue; font-size: 12px;">remove</a>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Button to add new plan row -->
        <br />
        <a href="#" @click.prevent="addPlan" style="text-decoration: underline; color: blue; font-size: 14px;">+ Add Plan</a>

        <!-- Display total MRR calculation based on price * customers -->
        <p style="margin-top: 1rem; font-weight: bold;">
          Total MRR: {{ selectedCurrency }}{{ totalMRR }}
        </p>
      </div>

      <!-- Right Column: Projection Table -->
      <div class="right-column">
        <!-- 1-Year Projection Table -->
        <h3>1-Year Projection Table</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Month</th>
              <th>Visitors</th>
              <th>Subscribers Gained</th>
              <th>Churned Customers</th>
              <th>Net Customers (End of Month)</th>
              <th>Projected MRR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(month, mIdx) in predictionMonths" :key="mIdx">
              <td>{{ month.name }}</td>
              <td>
                {{ getVisitorsForMonth(mIdx) }}
              </td>
              <td>
                {{ getSubscribersForMonth(mIdx) }}
              </td>
              <td>
                {{ getChurnForMonth(mIdx) }}
              </td>
              <td>
                {{ getNetCustomersForMonth(mIdx) }}
              </td>
              <td>
                {{ selectedCurrency }}{{ getProjectedMRRForMonth(mIdx) }}
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
const averageVisitorGrowthRate = ref(-2.66); // example from screenshot
const churnRate = ref(2);
const selectedCurrency = ref('$'); // Default currency is USD

// Breakdown Data - Updated to use price instead of mrr
const breakdownPlans = ref([
  {
    name: 'Starter',
    customers: 35,
    price: 10,
  },
  {
    name: 'Basic',
    customers: 30,
    price: 50,
  },
  // ... you can add more plan objects here if desired ...
]);

// Add/Remove plans
function addPlan() {
  breakdownPlans.value.push({
    name: 'New Plan',
    customers: 0,
    price: 0,
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
const predictionMonths = ref([
  { name: 'Jan', baseVisitors: 1000 },
  { name: 'Feb', baseVisitors: 1000 },
  { name: 'Mar', baseVisitors: 1000 },
  { name: 'Apr', baseVisitors: 1000 },
  { name: 'May', baseVisitors: 1000 },
  { name: 'Jun', baseVisitors: 1000 },
  { name: 'Jul', baseVisitors: 1000 },
  { name: 'Aug', baseVisitors: 1000 },
  { name: 'Sep', baseVisitors: 1000 },
  { name: 'Oct', baseVisitors: 1000 },
  { name: 'Nov', baseVisitors: 1000 },
  { name: 'Dec', baseVisitors: 1000 },
]);

// We can do naive calculations using averageVisitorGrowthRate, churnRate, etc.
// For demonstration only. Adjust to suit your actual use case.
function getVisitorsForMonth(monthIndex) {
  // Start from the base visitors of that month, then apply the growth rate cumulatively.
  // E.g., if first month is 1000, second month is 1000 * (1 + averageVisitorGrowthRate/100), etc.
  let visitors = predictionMonths.value[0].baseVisitors;
  for (let i = 0; i < monthIndex; i++) {
    visitors *= (1 + (averageVisitorGrowthRate.value / 100));
  }
  return visitors.toFixed(0);
}

function getSubscribersForMonth(monthIndex) {
  // Example: let's say 5% of visitors become subscribers.
  // This is just a placeholder formula.
  const visitors = parseInt(getVisitorsForMonth(monthIndex));
  const subscriberRate = 0.05; // 5% for example
  return Math.floor(visitors * subscriberRate);
}

function getChurnForMonth(monthIndex) {
  // We'll just say churn is 2% of existing customers as a naive approach,
  // or use the churnRate ref. This is up to you how to track total customers.
  const totalCustomersSoFar = getNetCustomersForMonth(monthIndex - 1);
  return Math.floor(totalCustomersSoFar * (churnRate.value / 100));
}

function getNetCustomersForMonth(monthIndex) {
  if (monthIndex < 0) return 0;
  // Net customers = net customers from previous month + new subscribers - churn
  // For demonstration only, might want to store or compute differently
  const prevMonthCustomers = getNetCustomersForMonth(monthIndex - 1);
  const newSubscribers = getSubscribersForMonth(monthIndex);
  const churned = getChurnForMonth(monthIndex);
  return prevMonthCustomers + newSubscribers - churned;
}

// New function to calculate projected MRR for each month
function getProjectedMRRForMonth(monthIndex) {
  const netCustomers = getNetCustomersForMonth(monthIndex);
  // Use the average price per customer to calculate projected MRR
  return (netCustomers * averagePricePerCustomer.value).toFixed(2);
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

input {
  width: 100px;
}

h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 16px;
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
</style> 