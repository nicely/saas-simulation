<!-- 
Excel-like interface in Vue 3 using Composition API
Import and use this component in your main App.vue or similar entry point.
-->

<template>
  <div :class="{ 'theme-hacker': selectedTheme === 'hacker', 'theme-terminal': selectedTheme === 'terminal', 'theme-amber': selectedTheme === 'amber', 'theme-monokai': selectedTheme === 'monokai' }" class="app-container">
    <!-- Storage Mode Selection Overlay -->
    <div v-if="showModeSelection" class="storage-mode-overlay">
      <div class="storage-mode-dialog">
        <h2>Choose Storage Mode</h2>
        <p>How would you like to save your presets?</p>
        <div class="storage-mode-buttons">
          <button @click="selectOnlineMode" class="mode-btn online-btn">
            <span class="icon">🌐</span>
            <span class="label">Go Online</span>
            <span class="description">Save in cloud, shareable via URL</span>
          </button>
          <button @click="selectOfflineMode" class="mode-btn offline-btn">
            <span class="icon">💻</span>
            <span class="label">Keep Offline</span>
            <span class="description">Save locally in this browser only</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- STEP 3: Main Content - Two-column layout -->
    <div class="two-column-layout" :class="{ 'blurred': showModeSelection }">
      <!-- Left Column: General Settings and Plan Information -->
      <div class="left-column">
        <!-- MRR Goal and Growth Rates Section -->
        <h3 id="general-settings">General Settings</h3>
        <!-- Add preset selector at the top of Basic Settings -->
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th colspan="2">Basic Settings</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Preset Configuration</td>
              <td>
                <div style="display: flex; gap: 5px; align-items: center;">
                  <select v-model="selectedPreset" @change="applyPreset" style="flex-grow: 1;">
                    <option value="levelsio">Levelsio Solo</option>
                    <option value="vc-startup">VC-Backed Startup</option>
                    <optgroup v-if="userPresets.length > 0" label="My Presets">
                      <option v-for="preset in userPresets" :key="preset.id" :value="preset.id">
                        {{ preset.name }} {{ selectedPreset === preset.id ? '(Auto-Save)' : '' }}
                      </option>
                    </optgroup>
                  </select>
                  <button @click="showPresetMenu = !showPresetMenu" class="small-btn" title="Manage presets">⚙️</button>
                </div>
                <div v-if="showPresetMenu" class="preset-menu">
                  <div class="preset-actions">
                    <button @click="saveCurrentAsPreset" class="action-btn">Save Current as New Preset</button>
                    <button v-if="isUserPreset" @click="updateCurrentPreset" class="action-btn" disabled title="Preset is automatically updated as you make changes">Update Selected Preset</button>
                    <button v-if="isUserPreset" @click="deleteSelectedPreset" class="action-btn delete-btn">Delete Selected</button>
                    <div v-if="isUserPreset" class="auto-save-info">
                      <small>Changes are automatically saved to this preset</small>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
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
              <td>Theme</td>
              <td>
                <select v-model="selectedTheme">
                  <option value="default">Default</option>
                  <option value="hacker">Hacker</option>
                  <option value="terminal">Terminal</option>
                  <option value="amber">Amber</option>
                  <option value="monokai">Monokai</option>
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
                    {{ month }} '{{ (currentYear % 100) }}
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
          <button 
            @click="showPlanDistribution = !showPlanDistribution" 
            class="toggle-btn"
            :class="{'expanded': showPlanDistribution}"
            :title="showPlanDistribution ? 'Hide distribution details' : 'Show distribution details'">
            Show distribution details <span class="arrow">&#9654;</span>
          </button>
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
                <input type="number" v-model.number="churnRateFactor" step="0.1" min="-5" max="2" title="Churn rate evolution: 1=constant, <1=gradual reduction, negative=faster reduction, >1=increasing churn (capped at 25%)" class="factor-input" />
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
        <!-- Show online indicator when in online mode -->
        <div v-if="isOnlineMode" class="online-indicator">
          <div class="online-badge">
            <span class="online-dot"></span>
            <span>Online Mode</span>
          </div>
          <div class="share-link">
            <input type="text" readonly :value="shareableLink" ref="shareLinkInput" />
            <button @click="copyShareLink" class="copy-btn" :title="copySuccess ? 'Copied!' : 'Copy link'">
              {{ copySuccess ? '✓' : 'Copy' }}
            </button>
          </div>
        </div>

        <!-- Projection Table with title showing start month -->
        <h3>Projection Analysis</h3>
        <div class="table-container">
          <table border="1" cellpadding="5" cellspacing="0">
            <thead>
              <tr>
                <th :colspan="showRateDetails ? 9 : 6">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>{{ maxProjectionMonths }}-Month Projection (Starting from {{ formatMonthWithYear((currentMonth + 1) % 12, Math.floor((currentMonth + 1) / 12)) }})</span>
                    <button 
                      @click="showRateDetails = !showRateDetails" 
                      class="toggle-btn"
                      :class="{'expanded': showRateDetails}"
                      :title="showRateDetails ? 'Hide rate details' : 'Show rate details'">
                      Show rate details <span class="arrow">&#9654;</span>
                    </button>
                  </div>
                </th>
              </tr>
              <tr>
                <th>Month</th>
                <th title="Projected website visitors per month with applied growth rate">Visitors</th>
                <th v-if="showRateDetails" title="Growth rate applied for this month">Growth%</th>
                <th title="New subscribers gained based on conversion rate applied to monthly visitors">Subs+</th>
                <th v-if="showRateDetails" title="Conversion rate applied for this month">Conv%</th>
                <th title="Subscribers lost based on churn rate applied to previous month's customer base">Churned</th>
                <th v-if="showRateDetails" title="Churn rate applied for this month">Churn%</th>
                <th title="Total customers at end of month: previous month + new subscribers - churn">Net Cust.</th>
                <th title="Projected revenue: Net customers × average price per customer">MRR</th>
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
        </div>

        <!-- Add MRR Goal Summary as a separate section -->
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th colspan="2">Target Revenue Analysis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Current MRR ({{ formatMonthWithYear(currentMonth) }})</td>
              <td>{{ selectedCurrency }}{{ totalMRR }}</td>
            </tr>
            <tr>
              <td>Projected MRR ({{ formatMonthWithYear((currentMonth + maxProjectionMonths) % 12, Math.floor((currentMonth + maxProjectionMonths) / 12)) }})</td>
              <td>{{ selectedCurrency }}{{ getLastMonthMRR() }}</td>
            </tr>
            <tr>
              <td>MRR Goal</td>
              <td>{{ selectedCurrency }}{{ mrrGoal }}</td>
            </tr>
            <tr>
              <td>Difference from MRR Goal</td>
              <td :class="{ 'positive': isGoalReached(), 'negative': !isGoalReached() }">
                {{ getMrrGoalSummary() }}
              </td>
            </tr>
            <tr class="separator-row">
              <td colspan="2"></td>
            </tr>
            <tr>
              <td>Current ARR ({{ formatMonthWithYear(currentMonth) }})</td>
              <td>{{ selectedCurrency }}{{ getCurrentARR() }}</td>
            </tr>
            <tr>
              <td>Projected ARR ({{ formatMonthWithYear((currentMonth + maxProjectionMonths) % 12, Math.floor((currentMonth + maxProjectionMonths) / 12)) }})</td>
              <td>{{ selectedCurrency }}{{ getProjectedARR() }}</td>
            </tr>
            <tr>
              <td>ARR Goal</td>
              <td>{{ selectedCurrency }}{{ getARRGoal() }}</td>
            </tr>
            <tr>
              <td>Difference from ARR Goal</td>
              <td :class="{ 'positive': isARRGoalReached(), 'negative': !isARRGoalReached() }">
                {{ getARRGoalSummary() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import { getCurrentInstance } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * STEP 0: Define all your state (reactive variables) and logic here in the <script setup> block.
 */

// STATE: All the app state variables that need to be persisted
const mrrGoal = ref(15802);
const initialVisitors = ref(1000);
const averageVisitorGrowthRate = ref(-2.66);
const visitorToInstallRate = ref(2.7);
const installToSubRate = ref(24);
const selectedCurrency = ref('$');
const maxProjectionMonths = ref(12);
const showRateDetails = ref(false);
const showPlanDistribution = ref(false);
const currentYear = ref(new Date().getFullYear());
const selectedTheme = ref('hacker');
const currentMonth = ref(new Date().getMonth());
const visitorGrowthFactor = ref(1.0);
const churnRateFactor = ref(1.0);
const visitorToInstallFactor = ref(1.05);
const installToSubFactor = ref(1.02);
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

// Month data - not persisted as it's constant
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Storage key for app state
const STORAGE_KEY = 'saas-projection-data';

// Add preset management state
const showPresetMenu = ref(false);
const userPresets = ref([]);
const USER_PRESETS_KEY = 'saas-projection-user-presets';

// Add preset configurations
const selectedPreset = ref('levelsio'); // Default to levelsio

// Preset configurations
const presets = {
  'levelsio': {
    mrrGoal: 50000,
    initialVisitors: 5000,
    averageVisitorGrowthRate: 30, // Exponential growth
    visitorToInstallRate: 2.0,
    installToSubRate: 25, // High conversion for solo business
    visitorGrowthFactor: 1.2, // Even more exponential
    churnRateFactor: 0.8, // Improving churn over time
    visitorToInstallFactor: 1.1,
    installToSubFactor: 1.1,
    plans: [
      {
        name: 'Starter',
        customers: 80,
        price: 29,
        churnRate: 5.0,
      },
      {
        name: 'Solo',
        customers: 40,
        price: 79,
        churnRate: 2.5,
      },
      {
        name: 'Team',
        customers: 10,
        price: 199,
        churnRate: 1.5,
      }
    ]
  },
  'vc-startup': {
    mrrGoal: 100000,
    initialVisitors: 10000,
    averageVisitorGrowthRate: 15,
    visitorToInstallRate: 3.5,
    installToSubRate: 15,
    visitorGrowthFactor: 1.1,
    churnRateFactor: 0.9,
    visitorToInstallFactor: 1.05,
    installToSubFactor: 1.05,
    plans: [
      {
        name: 'Basic',
        customers: 65,
        price: 49,
        churnRate: 5.0,
      },
      {
        name: 'Pro',
        customers: 30,
        price: 99,
        churnRate: 3.5,
      },
      {
        name: 'Enterprise',
        customers: 12,
        price: 299,
        churnRate: 2.0,
      },
      {
        name: 'Enterprise+',
        customers: 3,
        price: 999,
        churnRate: 1.0,
      }
    ]
  }
};

// Storage mode state
const isOnlineMode = ref(false);
const showModeSelection = ref(true);
const uniqueId = ref('');
const isLoading = ref(false);
const copySuccess = ref(false);
const shareLinkInput = ref(null);

// Computed value for the shareable link
const shareableLink = computed(() => {
  if (!isOnlineMode.value || !uniqueId.value) return '';
  return `${window.location.origin}${window.location.pathname}?id=${uniqueId.value}`;
});

// Function to copy the shareable link to clipboard
function copyShareLink() {
  if (!shareLinkInput.value) return;
  
  shareLinkInput.value.select();
  document.execCommand('copy');
  
  // Show success message briefly
  copySuccess.value = true;
  setTimeout(() => {
    copySuccess.value = false;
  }, 2000);
}

// Function to select online mode
async function selectOnlineMode() {
  isLoading.value = true;
  try {
    // Check if we have an ID in the URL
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('id');
    
    if (urlId) {
      // We have an ID, try to load data from Supabase
      uniqueId.value = urlId;
      await loadDataFromSupabase(urlId);
      // Apply the loaded preset after data is loaded
      applyPreset();
    } else {
      // Generate a new unique ID
      uniqueId.value = uuidv4();
      
      // Save current state to Supabase with the new ID
      await saveDataToSupabase();
      
      // Update URL with the new ID
      window.history.pushState({}, '', `?id=${uniqueId.value}`);
    }
    
    isOnlineMode.value = true;
    showModeSelection.value = false;
  } catch (error) {
    console.error('Error setting up online mode:', error);
    alert('There was an error connecting to the online service. Please try again or use offline mode.');
  } finally {
    isLoading.value = false;
  }
}

// Function to select offline mode
function selectOfflineMode() {
  isOnlineMode.value = false;
  showModeSelection.value = false;
  
  // Remove ID from URL if present
  if (window.location.search) {
    window.history.pushState({}, '', window.location.pathname);
  }
  
  // Load from localStorage
  loadStateFromLocalStorage();
  loadUserPresets();
}

// Function to save data to Supabase
async function saveDataToSupabase() {
  if (!isOnlineMode.value || !uniqueId.value) return;
  
  const dataToSave = {
    id: uniqueId.value,
    selectedPreset: selectedPreset.value,
    userPresets: userPresets.value,
    appState: {
      mrrGoal: mrrGoal.value,
      initialVisitors: initialVisitors.value,
      averageVisitorGrowthRate: averageVisitorGrowthRate.value,
      visitorToInstallRate: visitorToInstallRate.value,
      installToSubRate: installToSubRate.value,
      selectedCurrency: selectedCurrency.value,
      maxProjectionMonths: maxProjectionMonths.value,
      showRateDetails: showRateDetails.value,
      showPlanDistribution: showPlanDistribution.value,
      currentMonth: currentMonth.value,
      visitorGrowthFactor: visitorGrowthFactor.value,
      churnRateFactor: churnRateFactor.value,
      visitorToInstallFactor: visitorToInstallFactor.value,
      installToSubFactor: installToSubFactor.value,
      breakdownPlans: breakdownPlans.value,
      selectedTheme: selectedTheme.value
    },
    updated_at: new Date()
  };
  
  try {
    // Use upsert operation (insert if not exists, update if exists)
    const { error } = await supabase
      .from('saas_projections')
      .upsert(dataToSave, { 
        onConflict: 'id', 
        returning: 'minimal' 
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    // Just log the error but don't show alert since the data is still saved
  }
}

// Function to load data from Supabase
async function loadDataFromSupabase(id) {
  const { data, error } = await supabase
    .from('saas_projections')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw error;
  }
  
  if (data) {
    // Load user presets
    if (data.userPresets) {
      userPresets.value = data.userPresets;
    }
    
    // Load selected preset
    if (data.selectedPreset) {
      selectedPreset.value = data.selectedPreset;
    }
    
    // Load app state
    if (data.appState) {
      const state = data.appState;
      
      if (state.mrrGoal !== undefined) mrrGoal.value = state.mrrGoal;
      if (state.initialVisitors !== undefined) initialVisitors.value = state.initialVisitors;
      if (state.averageVisitorGrowthRate !== undefined) averageVisitorGrowthRate.value = state.averageVisitorGrowthRate;
      if (state.visitorToInstallRate !== undefined) visitorToInstallRate.value = state.visitorToInstallRate;
      if (state.installToSubRate !== undefined) installToSubRate.value = state.installToSubRate;
      if (state.selectedCurrency !== undefined) selectedCurrency.value = state.selectedCurrency;
      if (state.maxProjectionMonths !== undefined) maxProjectionMonths.value = state.maxProjectionMonths;
      if (state.showRateDetails !== undefined) showRateDetails.value = state.showRateDetails;
      if (state.showPlanDistribution !== undefined) showPlanDistribution.value = state.showPlanDistribution;
      if (state.currentMonth !== undefined) currentMonth.value = state.currentMonth;
      if (state.visitorGrowthFactor !== undefined) visitorGrowthFactor.value = state.visitorGrowthFactor;
      if (state.churnRateFactor !== undefined) churnRateFactor.value = state.churnRateFactor;
      if (state.visitorToInstallFactor !== undefined) visitorToInstallFactor.value = state.visitorToInstallFactor;
      if (state.installToSubFactor !== undefined) installToSubFactor.value = state.installToSubFactor;
      if (state.breakdownPlans && Array.isArray(state.breakdownPlans)) {
        breakdownPlans.value = state.breakdownPlans;
      }
      if (state.selectedTheme !== undefined) selectedTheme.value = state.selectedTheme;
      
      // Apply theme immediately
      applyTheme(selectedTheme.value);
    }
  }
}

// Function to check URL and decide whether to show selection screen
function checkUrlForId() {
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get('id');
  
  if (urlId) {
    // We have an ID in the URL, automatically choose online mode
    selectOnlineMode();
  } else {
    // No ID, show the selection screen
    showModeSelection.value = true;
  }
}

// Initialize on component mount
onBeforeMount(() => {
  checkUrlForId();
});

// Modified save function for multi-persistence support
function saveState() {
  if (isOnlineMode.value) {
    saveDataToSupabase();
  } else {
    saveStateToLocalStorage();
  }
}

// Function to apply theme
function applyTheme(theme) {
  if (theme === 'hacker') {
    document.documentElement.classList.add('theme-hacker');
    document.documentElement.classList.remove('light-mode');
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.remove('theme-terminal');
    document.documentElement.classList.remove('theme-amber');
    document.documentElement.classList.remove('theme-monokai');
  } else if (theme === 'terminal') {
    document.documentElement.classList.add('theme-terminal');
    document.documentElement.classList.remove('light-mode');
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.remove('theme-hacker');
    document.documentElement.classList.remove('theme-amber');
    document.documentElement.classList.remove('theme-monokai');
  } else if (theme === 'amber') {
    document.documentElement.classList.add('theme-amber');
    document.documentElement.classList.remove('light-mode');
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.remove('theme-hacker');
    document.documentElement.classList.remove('theme-terminal');
    document.documentElement.classList.remove('theme-monokai');
  } else if (theme === 'monokai') {
    document.documentElement.classList.add('theme-monokai');
    document.documentElement.classList.remove('light-mode');
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.remove('theme-hacker');
    document.documentElement.classList.remove('theme-terminal');
    document.documentElement.classList.remove('theme-amber');
  } else {
    document.documentElement.classList.remove('theme-hacker');
    document.documentElement.classList.remove('theme-terminal');
    document.documentElement.classList.remove('theme-amber');
    document.documentElement.classList.remove('theme-monokai');
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark-mode');
  }
  
  localStorage.setItem('selectedTheme', theme);
}

// Computed to check if current preset is a user preset
const isUserPreset = computed(() => {
  return userPresets.value.some(p => p.id === selectedPreset.value);
});

// Function to save current configuration as a new preset
function saveCurrentAsPreset() {
  // Prompt for name
  const presetName = prompt("Enter a name for this preset (changes will auto-save):");
  if (!presetName || presetName.trim() === '') return;
  
  // Generate unique ID
  const presetId = 'user-preset-' + Date.now();
  
  // Create preset object
  const newPreset = {
    id: presetId,
    name: presetName,
    mrrGoal: mrrGoal.value,
    initialVisitors: initialVisitors.value,
    averageVisitorGrowthRate: averageVisitorGrowthRate.value,
    visitorToInstallRate: visitorToInstallRate.value,
    installToSubRate: installToSubRate.value,
    visitorGrowthFactor: visitorGrowthFactor.value,
    churnRateFactor: churnRateFactor.value,
    visitorToInstallFactor: visitorToInstallFactor.value,
    installToSubFactor: installToSubFactor.value,
    plans: JSON.parse(JSON.stringify(breakdownPlans.value)) // Deep clone
  };
  
  // Add to user presets
  userPresets.value.push(newPreset);
  
  // Save to appropriate storage
  if (isOnlineMode.value) {
    saveDataToSupabase();
  } else {
    saveUserPresets();
  }
  
  // Select the new preset
  selectedPreset.value = presetId;
  
  // Close menu
  showPresetMenu.value = false;
}

// Function to update the current user preset
function updateCurrentPreset() {
  if (!isUserPreset.value) return;
  
  // Find the preset
  const presetIndex = userPresets.value.findIndex(p => p.id === selectedPreset.value);
  if (presetIndex === -1) return;
  
  // Confirm update
  if (!confirm(`Update preset "${userPresets.value[presetIndex].name}" with current values?`)) return;
  
  // Update preset data
  userPresets.value[presetIndex] = {
    ...userPresets.value[presetIndex], // Keep id and name
    mrrGoal: mrrGoal.value,
    initialVisitors: initialVisitors.value,
    averageVisitorGrowthRate: averageVisitorGrowthRate.value,
    visitorToInstallRate: visitorToInstallRate.value,
    installToSubRate: installToSubRate.value,
    visitorGrowthFactor: visitorGrowthFactor.value,
    churnRateFactor: churnRateFactor.value,
    visitorToInstallFactor: visitorToInstallFactor.value,
    installToSubFactor: installToSubFactor.value,
    plans: JSON.parse(JSON.stringify(breakdownPlans.value)) // Deep clone
  };
  
  // Save to appropriate storage
  if (isOnlineMode.value) {
    saveDataToSupabase();
  } else {
    saveUserPresets();
  }
  
  // Close menu
  showPresetMenu.value = false;
}

// Function to delete the selected user preset
function deleteSelectedPreset() {
  if (!isUserPreset.value) return;
  
  // Find the preset
  const presetIndex = userPresets.value.findIndex(p => p.id === selectedPreset.value);
  if (presetIndex === -1) return;
  
  // Confirm deletion
  const presetName = userPresets.value[presetIndex].name;
  if (!confirm(`Delete preset "${presetName}"? This cannot be undone.`)) return;
  
  // Remove the preset
  userPresets.value.splice(presetIndex, 1);
  
  // Save to appropriate storage
  if (isOnlineMode.value) {
    saveDataToSupabase();
  } else {
    saveUserPresets();
  }
  
  // Switch to levelsio preset
  selectedPreset.value = 'levelsio';
  
  // Close menu
  showPresetMenu.value = false;
}

// Function to save user presets to localStorage
function saveUserPresets() {
  localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(userPresets.value));
}

// Function to load user presets from localStorage
function loadUserPresets() {
  const savedPresets = localStorage.getItem(USER_PRESETS_KEY);
  if (savedPresets) {
    try {
      userPresets.value = JSON.parse(savedPresets);
    } catch (error) {
      console.error('Error loading user presets:', error);
    }
  }
}

// Function to apply a preset configuration
function applyPreset() {
  let preset;
  
  // Check if it's a built-in preset
  if (presets[selectedPreset.value]) {
    preset = presets[selectedPreset.value];
  } 
  // Check if it's a user preset
  else if (isUserPreset.value) {
    const userPreset = userPresets.value.find(p => p.id === selectedPreset.value);
    if (userPreset) {
      preset = userPreset;
    }
  }
  
  // If preset not found or empty, use Levelsio (the default)
  if (!preset || Object.keys(preset).length === 0) {
    selectedPreset.value = 'levelsio';
    preset = presets['levelsio'];
  }
  
  // Apply all preset values to reactive state
  if (preset.mrrGoal !== undefined) mrrGoal.value = preset.mrrGoal;
  if (preset.initialVisitors !== undefined) initialVisitors.value = preset.initialVisitors;
  if (preset.averageVisitorGrowthRate !== undefined) averageVisitorGrowthRate.value = preset.averageVisitorGrowthRate;
  if (preset.visitorToInstallRate !== undefined) visitorToInstallRate.value = preset.visitorToInstallRate;
  if (preset.installToSubRate !== undefined) installToSubRate.value = preset.installToSubRate;
  if (preset.visitorGrowthFactor !== undefined) visitorGrowthFactor.value = preset.visitorGrowthFactor;
  if (preset.churnRateFactor !== undefined) churnRateFactor.value = preset.churnRateFactor;
  if (preset.visitorToInstallFactor !== undefined) visitorToInstallFactor.value = preset.visitorToInstallFactor;
  if (preset.installToSubFactor !== undefined) installToSubFactor.value = preset.installToSubFactor;
  
  // Apply plan configurations if present
  if (preset.plans) {
    breakdownPlans.value = JSON.parse(JSON.stringify(preset.plans)); // Deep clone to avoid reference issues
  }
  
  // Save changes using the unified save function
  saveState();
}

// Get access to the global instance
const app = getCurrentInstance();

// Watch for theme changes and update the global app state
// Theme is handled separately since it's already been setup with persistence
watch(() => selectedTheme.value, (newTheme) => {
  // Update the global theme property
  if (app && app.appContext.config.globalProperties) {
    app.appContext.config.globalProperties.selectedTheme = newTheme
  }
  
  // Apply theme
  applyTheme(newTheme);
  
  // Save state
  saveState();
});

// Watch for changes in selected preset and save to Supabase when in online mode
watch(() => selectedPreset.value, (newPreset) => {
  if (isOnlineMode.value) {
    // Apply the preset to ensure all values are loaded
    applyPreset();
    // Then save to Supabase
    saveDataToSupabase();
  }
});

// Watch for changes in main inputs and save to localStorage
watch(
  [
    mrrGoal, 
    initialVisitors, 
    averageVisitorGrowthRate, 
    visitorToInstallRate, 
    installToSubRate,
    selectedCurrency,
    maxProjectionMonths,
    showRateDetails,
    showPlanDistribution,
    currentMonth,
    visitorGrowthFactor,
    churnRateFactor,
    visitorToInstallFactor,
    installToSubFactor,
    breakdownPlans
  ],
  () => {
    // Use the unified save function instead of directly calling localStorage
    saveState();
    
    // Automatically update the current preset if it's a user preset
    if (isUserPreset.value) {
      const presetIndex = userPresets.value.findIndex(p => p.id === selectedPreset.value);
      if (presetIndex !== -1) {
        // Update preset data with current values
        userPresets.value[presetIndex] = {
          ...userPresets.value[presetIndex], // Keep id and name
          mrrGoal: mrrGoal.value,
          initialVisitors: initialVisitors.value,
          averageVisitorGrowthRate: averageVisitorGrowthRate.value,
          visitorToInstallRate: visitorToInstallRate.value,
          installToSubRate: installToSubRate.value,
          visitorGrowthFactor: visitorGrowthFactor.value,
          churnRateFactor: churnRateFactor.value,
          visitorToInstallFactor: visitorToInstallFactor.value,
          installToSubFactor: installToSubFactor.value,
          plans: JSON.parse(JSON.stringify(breakdownPlans.value)) // Deep clone
        };
        
        // Save to persistence based on mode
        if (isOnlineMode.value) {
          saveDataToSupabase(); 
        } else {
          saveUserPresets();
        }
      }
    }
  },
  { deep: true }
);

// Update the plan management functions to save state
function addPlan() {
  breakdownPlans.value.push({
    name: 'New Plan',
    customers: 0,
    price: 0,
    churnRate: 2.0,
  });
  saveState();
}

function removePlan(idx) {
  breakdownPlans.value.splice(idx, 1);
  saveState();
}

// Load all saved state on component mount
onMounted(() => {
  // Theme selection is now handled in our applyTheme function
  // URL checking is handled in checkUrlForId (called in onBeforeMount)
  
  // Note: We don't need to load data here anymore as it's handled
  // by the selectOnlineMode/selectOfflineMode functions
  
  // Apply default theme if we don't have a selection yet
  if (!selectedTheme.value) {
    selectedTheme.value = 'hacker';
    applyTheme('hacker');
  }
});

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

// Helper function to format month with 2-digit year
function formatMonthWithYear(month, yearOffset = 0) {
  const year = (currentYear.value + yearOffset) % 100; // Get last 2 digits of year
  return `${monthNames[month]} '${year}`;
}

// Predictions
const predictionMonths = computed(() => {
  const months = [];
  
  // Generate months starting from the NEXT month after currentMonth
  for (let i = 0; i < maxProjectionMonths.value; i++) {
    const monthIndex = (currentMonth.value + i + 1) % 12; // +1 to start from next month
    
    // Calculate year offset based on month cycling
    const yearOffset = Math.floor((currentMonth.value + i + 1) / 12);
    
    months.push({
      name: formatMonthWithYear(monthIndex, yearOffset),
      index: monthIndex,
      projectionIndex: i, // This is the index used for calculations (0-11)
      yearOffset: yearOffset // Store year offset for reference
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
  
  // When churnRateFactor is 1, keep churn constant
  if (churnRateFactor.value === 1) {
    return rate;
  }
  
  // When churnRateFactor is negative, interpret as aggressive reduction
  if (churnRateFactor.value < 0) {
    // Calculate the reduction percentage (larger negative numbers mean faster reduction)
    const reductionPercentage = Math.min(Math.abs(churnRateFactor.value) * 0.1, 0.5); // Cap at 50% reduction per month
    
    // Apply the reduction for each month
    for (let i = 0; i < monthIndex; i++) {
      rate = rate * (1 - reductionPercentage);
    }
    
    // Ensure we don't go below 0% churn
    return Math.max(rate, 0);
  }
  
  // When churnRateFactor is between 0 and 1, decrease churn rate over time
  if (churnRateFactor.value < 1) {
    // Calculate percentage reduction per month
    let reductionRate = 1 - churnRateFactor.value;
    
    // Apply reduction for each month
    for (let i = 0; i < monthIndex; i++) {
      // Reduce by the percentage determined by the factor
      rate = rate * (1 - reductionRate);
    }
    
    // Ensure we don't go below 0% churn
    return Math.max(rate, 0);
  }
  
  // When churnRateFactor is greater than 1, increase churn rate over time (original behavior)
  for (let i = 0; i < monthIndex; i++) {
    rate *= churnRateFactor.value;
  }
  
  // Cap the maximum churn rate at 25% to prevent unrealistic scenarios
  return Math.min(rate, 25);
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

// ARR Calculations
function getCurrentARR() {
  return (totalMRR.value * 12).toFixed(2);
}

function getProjectedARR() {
  return (parseFloat(getLastMonthMRR()) * 12).toFixed(2);
}

function getARRGoal() {
  return (mrrGoal.value * 12).toFixed(2);
}

function isARRGoalReached() {
  return parseFloat(getProjectedARR()) >= parseFloat(getARRGoal());
}

function getARRGoalSummary() {
  const projectedARR = parseFloat(getProjectedARR());
  const arrGoal = parseFloat(getARRGoal());
  const difference = projectedARR - arrGoal;
  const prefix = difference >= 0 ? '+' : '';
  return `${prefix}${selectedCurrency.value}${difference.toFixed(2)} (${prefix}${(difference / arrGoal * 100).toFixed(1)}%)`;
}

// Function to save current state to localStorage
const saveStateToLocalStorage = () => {
  const stateToSave = {
    selectedPreset: selectedPreset.value,
    mrrGoal: mrrGoal.value,
    initialVisitors: initialVisitors.value,
    averageVisitorGrowthRate: averageVisitorGrowthRate.value,
    visitorToInstallRate: visitorToInstallRate.value,
    installToSubRate: installToSubRate.value,
    selectedCurrency: selectedCurrency.value,
    maxProjectionMonths: maxProjectionMonths.value,
    showRateDetails: showRateDetails.value,
    showPlanDistribution: showPlanDistribution.value,
    currentMonth: currentMonth.value,
    visitorGrowthFactor: visitorGrowthFactor.value,
    churnRateFactor: churnRateFactor.value,
    visitorToInstallFactor: visitorToInstallFactor.value,
    installToSubFactor: installToSubFactor.value,
    breakdownPlans: breakdownPlans.value
  };
  
  localStorage.setItem('saasProjectorState', JSON.stringify(stateToSave));
};

// Function to load saved state from localStorage
const loadStateFromLocalStorage = () => {
  const savedState = localStorage.getItem('saasProjectorState');
  
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      
      // Load selected preset first (important to do this before other values)
      if (state.selectedPreset !== undefined) {
        selectedPreset.value = state.selectedPreset;
      }
      
      // Load basic metrics
      if (state.mrrGoal !== undefined) mrrGoal.value = state.mrrGoal;
      if (state.initialVisitors !== undefined) initialVisitors.value = state.initialVisitors;
      if (state.averageVisitorGrowthRate !== undefined) averageVisitorGrowthRate.value = state.averageVisitorGrowthRate;
      if (state.visitorToInstallRate !== undefined) visitorToInstallRate.value = state.visitorToInstallRate;
      if (state.installToSubRate !== undefined) installToSubRate.value = state.installToSubRate;
      if (state.selectedCurrency !== undefined) selectedCurrency.value = state.selectedCurrency;
      if (state.maxProjectionMonths !== undefined) maxProjectionMonths.value = state.maxProjectionMonths;
      if (state.showRateDetails !== undefined) showRateDetails.value = state.showRateDetails;
      if (state.showPlanDistribution !== undefined) showPlanDistribution.value = state.showPlanDistribution;
      if (state.currentMonth !== undefined) currentMonth.value = state.currentMonth;
      if (state.visitorGrowthFactor !== undefined) visitorGrowthFactor.value = state.visitorGrowthFactor;
      if (state.churnRateFactor !== undefined) churnRateFactor.value = state.churnRateFactor;
      if (state.visitorToInstallFactor !== undefined) visitorToInstallFactor.value = state.visitorToInstallFactor;
      if (state.installToSubFactor !== undefined) installToSubFactor.value = state.installToSubFactor;
      
      // Load plan types
      if (state.breakdownPlans && Array.isArray(state.breakdownPlans)) {
        breakdownPlans.value = state.breakdownPlans;
      }
      
      // Verify that the selected preset is valid
      if (selectedPreset.value !== 'levelsio' && 
          selectedPreset.value !== 'vc-startup' && 
          !userPresets.value.some(p => p.id === selectedPreset.value)) {
        // If the preset doesn't exist, fall back to levelsio
        selectedPreset.value = 'levelsio';
      }
      
      console.log('Loaded saved state with preset:', selectedPreset.value);
      
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }
};
</script>

<style scoped>
/* Global container styles */
.app-container {
  padding: 40px 20px 20px 20px;
  min-height: 100vh;
  transition: all 0.3s ease;
  background-color: var(--bg-color, #fff);
  color: var(--text-color, #333);
}

/* Storage Mode Overlay */
.storage-mode-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.storage-mode-dialog {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 600px;
  text-align: center;
}

.storage-mode-dialog h2 {
  margin-top: 0;
  font-size: 24px;
  margin-bottom: 10px;
}

.storage-mode-dialog p {
  margin-bottom: 25px;
  color: #555;
}

.storage-mode-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  background-color: white;
  flex: 1;
  min-width: 180px;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.mode-btn .icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.mode-btn .label {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 5px;
}

.mode-btn .description {
  font-size: 12px;
  color: #777;
}

.online-btn {
  border-color: #4285f4;
}

.online-btn:hover {
  background-color: #f0f7ff;
}

.offline-btn {
  border-color: #34a853;
}

.offline-btn:hover {
  background-color: #f0fff7;
}

.blurred {
  filter: blur(5px);
  pointer-events: none;
  user-select: none;
}

/* Theme-specific overlay styles */
.theme-hacker .storage-mode-dialog {
  background-color: #000;
  border: 1px solid #0f0;
  color: #0f0;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
}

.theme-hacker .storage-mode-dialog p {
  color: #0f0;
  opacity: 0.8;
}

.theme-hacker .mode-btn {
  background-color: #000;
  color: #0f0;
  border-color: #0f0;
}

.theme-hacker .mode-btn .description {
  color: #0f0;
  opacity: 0.7;
}

.theme-hacker .online-btn:hover {
  background-color: rgba(0, 255, 0, 0.1);
}

.theme-hacker .offline-btn:hover {
  background-color: rgba(0, 255, 0, 0.1);
}

.theme-terminal .storage-mode-dialog {
  background-color: #000;
  border: 1px solid #a8a8a8;
  color: #a8a8a8;
  box-shadow: 0 0 20px rgba(168, 168, 168, 0.2);
}

.theme-terminal .storage-mode-dialog p {
  color: #a8a8a8;
  opacity: 0.8;
}

.theme-terminal .mode-btn {
  background-color: #000;
  color: #a8a8a8;
  border-color: #a8a8a8;
}

.theme-terminal .mode-btn .description {
  color: #a8a8a8;
  opacity: 0.7;
}

.theme-terminal .online-btn:hover,
.theme-terminal .offline-btn:hover {
  background-color: rgba(168, 168, 168, 0.1);
}

.theme-amber .storage-mode-dialog {
  background-color: #000;
  border: 1px solid #ffb000;
  color: #ffb000;
  box-shadow: 0 0 20px rgba(255, 176, 0, 0.2);
}

.theme-amber .storage-mode-dialog p {
  color: #ffb000;
  opacity: 0.8;
}

.theme-amber .mode-btn {
  background-color: #000;
  color: #ffb000;
  border-color: #ffb000;
}

.theme-amber .mode-btn .description {
  color: #ffb000;
  opacity: 0.7;
}

.theme-amber .online-btn:hover,
.theme-amber .offline-btn:hover {
  background-color: rgba(255, 176, 0, 0.1);
}

.theme-monokai .storage-mode-dialog {
  background-color: #272822;
  border: 1px solid #49483e;
  color: #f8f8f2;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
}

.theme-monokai .storage-mode-dialog p {
  color: #f8f8f2;
  opacity: 0.8;
}

.theme-monokai .mode-btn {
  background-color: #272822;
  color: #f8f8f2;
  border-color: #49483e;
}

.theme-monokai .mode-btn .description {
  color: #f8f8f2;
  opacity: 0.7;
}

.theme-monokai .online-btn {
  border-color: #66d9ef;
}

.theme-monokai .offline-btn {
  border-color: #a6e22e;
}

.theme-monokai .online-btn:hover,
.theme-monokai .offline-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Title spacing to prevent cutting off */
#general-settings {
  margin-top: 0;
  padding-top: 0;
}

/* Table container to handle overflow */
.table-container {
  overflow-x: auto;
  max-width: 100%;
  margin-bottom: 20px;
}

/* Minimal styling so everything looks like a basic table. Adjust as needed. */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th, td {
  text-align: left;
  padding: 5px;
  font-size: 12px;
}

/* Ensure table doesn't overflow container */
.right-column {
  overflow-x: auto;
}

/* Make projection table more compact when details are shown */
.right-column table th,
.right-column table td {
  white-space: nowrap;
}

/* Make the month column wider in the projection table */
.right-column table th:first-child,
.right-column table td:first-child {
  min-width: 70px;
  width: 70px;
}

/* Adjust number columns to be more compact */
.right-column table th:not(:first-child),
.right-column table td:not(:first-child) {
  text-align: right;
  width: auto;
  min-width: 60px;
}

/* Target MRR Analysis table styling - make columns equal width */
.right-column table:last-of-type td:first-child,
.right-column table:last-of-type td:last-child {
  width: 50%;
  white-space: normal;
}

h3, h4 {
  text-align: left;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 16px;
}

input {
  width: 100px;
}

/* Two-column layout styles with responsive behavior */
.two-column-layout {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.left-column {
  flex: 1;
  min-width: 300px;
  max-width: 40%;
}

.right-column {
  flex: 2;
  min-width: 450px;
  max-width: 60%;
}

@media (max-width: 900px) {
  .two-column-layout {
    flex-direction: column;
  }
  
  .left-column,
  .right-column {
    max-width: 100%;
    min-width: 100%;
  }
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

/* Hacker Theme Styles */
.theme-hacker {
  background-color: #000 !important;
  color: #0f0 !important;
  font-family: 'Courier New', monospace !important;
  transition: all 0.3s ease;
  padding: 20px;
  position: relative;
}

/* Style tables in hacker theme */
.theme-hacker table {
  border-color: #0f0;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
}

.theme-hacker th {
  background-color: #001800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.theme-hacker th,
.theme-hacker td {
  border-color: #0f0;
}

/* Style form elements in hacker theme */
.theme-hacker input,
.theme-hacker select {
  background-color: #000;
  color: #0f0;
  border: 1px solid #0f0;
}

/* Style headings in hacker theme */
.theme-hacker h3,
.theme-hacker h4 {
  color: #0f0;
  text-shadow: 0 0 5px #0f0;
}

/* Style the summary row in hacker theme */
.theme-hacker .summary-row {
  background-color: #001800;
}

.theme-hacker .summary-row td {
  border-top: 2px solid #0f0;
}

/* Override colors for positive/negative in hacker theme */
.theme-hacker .positive {
  color: #0f0;
  font-weight: bold;
  text-shadow: 0 0 5px #0f0;
}

.theme-hacker .negative {
  color: #f00;
  font-weight: bold;
}

/* Style links in hacker theme */
.theme-hacker a {
  color: #0f0 !important;
  text-decoration: underline;
}

.theme-hacker a:hover {
  text-shadow: 0 0 5px #0f0;
}

/* Add subtle scanline effect */
.theme-hacker::before {
  content: "";
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: linear-gradient(
    rgba(0, 50, 0, 0.1) 50%, 
    rgba(0, 0, 0, 0.1) 50%
  );
  background-size: 100% 4px;
  z-index: 1000;
  opacity: 0.15;
}

/* Toggle button styling */
.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: inherit;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.theme-hacker .toggle-btn:hover {
  background-color: rgba(0, 255, 0, 0.1);
}

.arrow {
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 10px;
  margin-top: 1px;
}

.toggle-btn.expanded .arrow {
  transform: rotate(90deg);
}

/* Terminal Theme Styles - Classic gray boot screen look */
.theme-terminal {
  background-color: #000000 !important;
  color: #a8a8a8 !important;
  font-family: 'Courier New', monospace !important;
  transition: all 0.3s ease;
  padding: 20px;
  position: relative;
}

/* Style tables in terminal theme */
.theme-terminal table {
  border-color: #a8a8a8;
  box-shadow: 0 0 10px rgba(168, 168, 168, 0.2);
}

.theme-terminal th {
  background-color: #181818;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.theme-terminal th,
.theme-terminal td {
  border-color: #a8a8a8;
}

/* Style form elements in terminal theme */
.theme-terminal input,
.theme-terminal select {
  background-color: #000;
  color: #a8a8a8;
  border: 1px solid #a8a8a8;
}

/* Style headings in terminal theme */
.theme-terminal h3,
.theme-terminal h4 {
  color: #a8a8a8;
  text-shadow: 0 0 5px #a8a8a8;
}

/* Style the summary row in terminal theme */
.theme-terminal .summary-row {
  background-color: #181818;
}

.theme-terminal .summary-row td {
  border-top: 2px solid #a8a8a8;
}

/* Override colors for positive/negative in terminal theme */
.theme-terminal .positive {
  color: #a8a8a8;
  font-weight: bold;
  text-shadow: 0 0 5px #a8a8a8;
}

.theme-terminal .negative {
  color: #a8a8a8;
  font-weight: bold;
}

/* Style links in terminal theme */
.theme-terminal a {
  color: #a8a8a8 !important;
  text-decoration: underline;
}

.theme-terminal a:hover {
  text-shadow: 0 0 5px #a8a8a8;
}

/* Add CRT flicker effect */
.theme-terminal::before {
  content: "";
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  opacity: 0.3;
  z-index: 1000;
}

/* Override toggle button for terminal theme */
.theme-terminal .toggle-btn:hover {
  background-color: rgba(168, 168, 168, 0.1);
}

/* Amber Theme Styles - Classic amber/orange terminal */
.theme-amber {
  background-color: #000000 !important;
  color: #ffb000 !important;
  font-family: 'Courier New', monospace !important;
  transition: all 0.3s ease;
  padding: 20px;
  position: relative;
}

/* Style tables in amber theme */
.theme-amber table {
  border-color: #ffb000;
  box-shadow: 0 0 10px rgba(255, 176, 0, 0.2);
}

.theme-amber th {
  background-color: #1a1000;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.theme-amber th,
.theme-amber td {
  border-color: #ffb000;
}

/* Style form elements in amber theme */
.theme-amber input,
.theme-amber select {
  background-color: #000;
  color: #ffb000;
  border: 1px solid #ffb000;
}

/* Style headings in amber theme */
.theme-amber h3,
.theme-amber h4 {
  color: #ffb000;
  text-shadow: 0 0 5px #ffb000;
}

/* Style the summary row in amber theme */
.theme-amber .summary-row {
  background-color: #1a1000;
}

.theme-amber .summary-row td {
  border-top: 2px solid #ffb000;
}

/* Override colors for positive/negative in amber theme */
.theme-amber .positive {
  color: #ffb000;
  font-weight: bold;
  text-shadow: 0 0 5px #ffb000;
}

.theme-amber .negative {
  color: #ffb000;
  font-weight: bold;
}

/* Style links in amber theme */
.theme-amber a {
  color: #ffb000 !important;
  text-decoration: underline;
}

.theme-amber a:hover {
  text-shadow: 0 0 5px #ffb000;
}

/* Add CRT flicker effect with amber color */
.theme-amber::before {
  content: "";
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 176, 0, 0.03),
    rgba(255, 176, 0, 0.03) 1px,
    transparent 1px,
    transparent 2px
  );
  opacity: 0.3;
  z-index: 1000;
}

/* Override toggle button for amber theme */
.theme-amber .toggle-btn:hover {
  background-color: rgba(255, 176, 0, 0.1);
}

/* Monokai Theme Styles */
.theme-monokai {
  background-color: #272822 !important;
  color: #f8f8f2 !important;
  font-family: 'Consolas', 'Monaco', monospace !important;
  transition: all 0.3s ease;
  padding: 20px;
  position: relative;
}

/* Style tables in monokai theme */
.theme-monokai table {
  border-color: #49483e;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.theme-monokai th {
  background-color: #3e3d32;
  letter-spacing: 0.5px;
}

.theme-monokai th,
.theme-monokai td {
  border-color: #49483e;
}

/* Style form elements in monokai theme */
.theme-monokai input,
.theme-monokai select {
  background-color: #272822;
  color: #f8f8f2;
  border: 1px solid #49483e;
}

/* Style headings in monokai theme */
.theme-monokai h3,
.theme-monokai h4 {
  color: #fd971f; /* Orange */
}

/* Style the summary row in monokai theme */
.theme-monokai .summary-row {
  background-color: #3e3d32;
}

.theme-monokai .summary-row td {
  border-top: 2px solid #f92672; /* Pink */
}

/* Override colors for positive/negative in monokai theme */
.theme-monokai .positive {
  color: #a6e22e; /* Green */
  font-weight: bold;
}

.theme-monokai .negative {
  color: #f92672; /* Pink */
  font-weight: bold;
}

/* Style links in monokai theme */
.theme-monokai a {
  color: #66d9ef !important; /* Blue */
  text-decoration: none;
}

.theme-monokai a:hover {
  color: #ae81ff !important; /* Purple */
  text-decoration: underline;
}

/* Override toggle button for monokai theme */
.theme-monokai .toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.theme-monokai .toggle-btn {
  color: #f8f8f2;
}

/* Add a separator row style */
.separator-row {
  border-bottom: 1px solid var(--border-color, #eee);
  height: 10px;
}

.theme-hacker .separator-row {
  border-bottom: 1px solid #0f0;
}

.theme-terminal .separator-row {
  border-bottom: 1px solid #a8a8a8;
}

.theme-amber .separator-row {
  border-bottom: 1px solid #ffb000;
}

.theme-monokai .separator-row {
  border-bottom: 1px solid #49483e;
}

/* Remove blinking cursor animations from all themes */
.theme-hacker h3::after,
.theme-terminal h3::after,
.theme-amber h3::after {
  content: "";
  animation: none;
  margin-left: 0;
}

/* Add styles for preset management */
.preset-menu {
  margin-top: 5px;
  padding: 8px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  background-color: var(--bg-color, #fff);
}

.preset-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.action-btn {
  padding: 3px;
  font-size: 12px;
  border: 1px solid var(--border-color, #ddd);
  background-color: var(--button-bg, #f5f5f5);
  color: var(--text-color, #333);
  cursor: pointer;
  border-radius: 3px;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.delete-btn {
  color: #dc3545;
}

.small-btn {
  background: none;
  border: 1px solid var(--border-color, #ddd);
  padding: 2px 6px;
  cursor: pointer;
  border-radius: 3px;
}

.small-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Theme-specific styles for preset menu */
.theme-hacker .preset-menu {
  border-color: #0f0;
  background-color: #000;
}

.theme-hacker .action-btn {
  border-color: #0f0;
  background-color: #001800;
  color: #0f0;
}

.theme-hacker .action-btn:hover {
  background-color: rgba(0, 255, 0, 0.1);
}

.theme-hacker .small-btn {
  border-color: #0f0;
  color: #0f0;
}

.theme-hacker .delete-btn {
  color: #f00;
}

.theme-terminal .preset-menu {
  border-color: #a8a8a8;
  background-color: #000;
}

.theme-terminal .action-btn {
  border-color: #a8a8a8;
  background-color: #181818;
  color: #a8a8a8;
}

.theme-terminal .action-btn:hover {
  background-color: rgba(168, 168, 168, 0.1);
}

.theme-terminal .small-btn {
  border-color: #a8a8a8;
  color: #a8a8a8;
}

.theme-amber .preset-menu {
  border-color: #ffb000;
  background-color: #000;
}

.theme-amber .action-btn {
  border-color: #ffb000;
  background-color: #1a1000;
  color: #ffb000;
}

.theme-amber .action-btn:hover {
  background-color: rgba(255, 176, 0, 0.1);
}

.theme-amber .small-btn {
  border-color: #ffb000;
  color: #ffb000;
}

.theme-monokai .preset-menu {
  border-color: #49483e;
  background-color: #272822;
}

.theme-monokai .action-btn {
  border-color: #49483e;
  background-color: #3e3d32;
  color: #f8f8f2;
}

.theme-monokai .action-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.theme-monokai .small-btn {
  border-color: #49483e;
  color: #fd971f;
}

.theme-monokai .delete-btn {
  color: #f92672;
}

/* Auto-save indicator styles */
.auto-save-info {
  margin-top: 8px;
  padding: 5px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.05);
  font-style: italic;
  text-align: center;
}

.theme-hacker .auto-save-info {
  background-color: rgba(0, 255, 0, 0.1);
  color: #0f0;
}

.theme-terminal .auto-save-info {
  background-color: rgba(168, 168, 168, 0.1);
  color: #a8a8a8;
}

.theme-amber .auto-save-info {
  background-color: rgba(255, 176, 0, 0.1);
  color: #ffb000;
}

.theme-monokai .auto-save-info {
  background-color: rgba(255, 255, 255, 0.05);
  color: #a6e22e;
}

/* Add a sharing indicator to the top right of the app when in online mode */
.online-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  flex-wrap: wrap;
  gap: 10px;
}

.online-badge {
  display: flex;
  align-items: center;
  gap: 5px;
}

.online-dot {
  width: 10px;
  height: 10px;
  background-color: #4caf50;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.share-link {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-grow: 1;
}

.share-link input {
  flex-grow: 1;
  min-width: 200px;
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.copy-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 4px 10px;
  font-size: 12px;
  color: #333;
  transition: all 0.2s ease;
  border-radius: 4px;
  white-space: nowrap;
}

.copy-btn:hover {
  background-color: #e0e0e0;
}

.copy-btn:active {
  transform: scale(0.95);
}

/* Theme-specific online indicator styles */
.theme-hacker .online-indicator {
  background-color: #000;
  border: 1px solid #0f0;
}

.theme-hacker .online-dot {
  background-color: #0f0;
}

.theme-hacker .share-link input {
  background-color: #000;
  color: #0f0;
  border-color: #0f0;
}

.theme-hacker .copy-btn {
  background-color: #001800;
  color: #0f0;
  border-color: #0f0;
}

.theme-hacker .copy-btn:hover {
  background-color: rgba(0, 255, 0, 0.1);
}

.theme-terminal .online-indicator {
  background-color: #000;
  border: 1px solid #a8a8a8;
}

.theme-terminal .online-dot {
  background-color: #a8a8a8;
}

.theme-terminal .share-link input {
  background-color: #000;
  color: #a8a8a8;
  border-color: #a8a8a8;
}

.theme-terminal .copy-btn {
  background-color: #181818;
  color: #a8a8a8;
  border-color: #a8a8a8;
}

.theme-terminal .copy-btn:hover {
  background-color: rgba(168, 168, 168, 0.1);
}

.theme-amber .online-indicator {
  background-color: #000;
  border: 1px solid #ffb000;
}

.theme-amber .online-dot {
  background-color: #ffb000;
}

.theme-amber .share-link input {
  background-color: #000;
  color: #ffb000;
  border-color: #ffb000;
}

.theme-amber .copy-btn {
  background-color: #1a1000;
  color: #ffb000;
  border-color: #ffb000;
}

.theme-amber .copy-btn:hover {
  background-color: rgba(255, 176, 0, 0.1);
}

.theme-monokai .online-indicator {
  background-color: #272822;
  border: 1px solid #49483e;
}

.theme-monokai .online-dot {
  background-color: #66d9ef;
}

.theme-monokai .share-link input {
  background-color: #272822;
  color: #f8f8f2;
  border-color: #49483e;
}

.theme-monokai .copy-btn {
  background-color: #3e3d32;
  color: #f8f8f2;
  border-color: #49483e;
}

.theme-monokai .copy-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

/* Theme-specific pulse animations */
.theme-hacker .online-dot {
  animation: pulse-hacker 1.5s infinite;
}

@keyframes pulse-hacker {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(0, 255, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
  }
}

.theme-terminal .online-dot {
  animation: pulse-terminal 1.5s infinite;
}

@keyframes pulse-terminal {
  0% {
    box-shadow: 0 0 0 0 rgba(168, 168, 168, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(168, 168, 168, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(168, 168, 168, 0);
  }
}

.theme-amber .online-dot {
  animation: pulse-amber 1.5s infinite;
}

@keyframes pulse-amber {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 176, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(255, 176, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 176, 0, 0);
  }
}
</style>
