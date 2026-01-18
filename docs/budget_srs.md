# Agile Software Requirements Specification
## Wallet Budget Management System

**Version:** 1.0  
**Date:** 2025-12-21  
**Status:** Draft for Review

---

## 1. Product Vision

> Enable users to take complete control of their personal finances by setting, tracking, and achieving spending limits and savings goals—transforming the wallet from a transaction tracker into a proactive financial planning tool.

### 1.1 Goals
- Allow users to set monthly/yearly budgets per category
- Provide real-time visual feedback on budget consumption
- Alert users before they exceed budget limits
- Enable savings goals with progress tracking
- Deliver actionable insights on budget performance

### 1.2 Success Metrics
| Metric | Target |
|--------|--------|
| Budget creation rate | 70% of active users create at least 1 budget |
| Alert engagement | 50% of triggered alerts lead to reduced spending |
| Savings goal completion | 40% of savings goals reach target |
| User retention | 15% increase in weekly active users |

---

## 2. User Personas

### 2.1 Primary: Budget-Conscious Individual
- **Age:** 25-45
- **Goals:** Track spending, avoid overspending, build savings
- **Pain Points:** Loses track of spending, no visibility into category limits
- **Tech Comfort:** Moderate to high

### 2.2 Secondary: Financial Planner
- **Age:** 30-55
- **Goals:** Comprehensive view of finances, plan for large purchases
- **Pain Points:** Lacks consolidated budget view, manual tracking in spreadsheets
- **Tech Comfort:** High

---

## 3. Epics & User Stories

### Epic 1: Budget CRUD Operations

#### US-1.1: Create Category Budget
> As a user, I want to set a spending limit for a category so that I can control my expenses.

**Acceptance Criteria:**
- [ ] Can select an existing expense category
- [ ] Can enter budget amount (positive number, 2 decimal places)
- [ ] Can choose period: monthly, quarterly, or yearly
- [ ] Can enable/disable rollover of unused amount
- [ ] Budget is saved and appears in budget list
- [ ] Cannot create duplicate budget for same category + period

**Story Points:** 5

---

#### US-1.2: View Budget List
> As a user, I want to see all my budgets in one place so that I can manage them easily.

**Acceptance Criteria:**
- [ ] Display all budgets in a list/grid view
- [ ] Show: category name, icon, color, budget amount, spent amount, remaining
- [ ] Show progress bar with color coding (green < 80%, yellow 80-100%, red > 100%)
- [ ] Sort by: category name, amount, percentage used
- [ ] Filter by: period type, status (under/over budget)

**Story Points:** 5

---

#### US-1.3: Update Budget
> As a user, I want to modify my budget settings so that I can adjust to changing needs.

**Acceptance Criteria:**
- [ ] Can edit budget amount
- [ ] Can change period type
- [ ] Can toggle rollover setting
- [ ] Changes take effect immediately
- [ ] Historical data preserved (spent amounts unchanged)

**Story Points:** 3

---

#### US-1.4: Delete Budget
> As a user, I want to remove a budget so that I can stop tracking categories I no longer need.

**Acceptance Criteria:**
- [ ] Confirmation dialog before deletion
- [ ] Budget removed from list
- [ ] Historical budget data preserved for analytics (soft delete)
- [ ] Transactions remain unaffected

**Story Points:** 2

---

### Epic 2: Budget Tracking & Visualization

#### US-2.1: Dashboard Budget Widget
> As a user, I want to see my budget status on the dashboard so that I get a quick overview.

**Acceptance Criteria:**
- [ ] Shows top 5 budgets sorted by percentage used (highest first)
- [ ] Each shows: category, progress bar, spent/total
- [ ] Click to expand full budget list
- [ ] Empty state if no budgets created
- [ ] Responsive layout for mobile

**Story Points:** 5

---

#### US-2.2: Budget Progress Bars
> As a user, I want visual progress indicators so that I can quickly assess my spending status.

**Acceptance Criteria:**
- [ ] Progress bar fills based on (spent / budget) * 100
- [ ] Color thresholds: green (0-79%), yellow (80-99%), red (100%+)
- [ ] Overflow visual for exceeded budgets (e.g., striped pattern)
- [ ] Animated progress on load
- [ ] Tooltip showing exact amounts on hover

**Story Points:** 3

---

#### US-2.3: Budget Detail View
> As a user, I want to see detailed spending within a budget so that I can understand where money went.

**Acceptance Criteria:**
- [ ] Show total budget, spent, remaining
- [ ] List all transactions in that category for current period
- [ ] Show daily/weekly spending breakdown chart
- [ ] Compare to previous period (if available)
- [ ] Quick link to add transaction in this category

**Story Points:** 5

---

#### US-2.4: Period-Based Budget Tracking
> As a user, I want budgets to reset based on their period so that I get fresh tracking each cycle.

**Acceptance Criteria:**
- [ ] Monthly budgets reset on 1st of each month
- [ ] Quarterly budgets reset on Jan 1, Apr 1, Jul 1, Oct 1
- [ ] Yearly budgets reset on Jan 1
- [ ] Support custom start date for periods
- [ ] Previous period data accessible in history

**Story Points:** 5

---

#### US-2.5: Budget Rollover
> As a user, I want unused budget to carry forward so that I'm not penalized for saving.

**Acceptance Criteria:**
- [ ] When rollover enabled, unused amount adds to next period's budget
- [ ] Show base budget + rollover separately
- [ ] Cap rollover at configurable limit (e.g., 100% of base budget)
- [ ] Clear visual distinction between base and rollover amounts

**Story Points:** 5

---

### Epic 3: Budget Alerts & Notifications

#### US-3.1: Budget Threshold Alerts
> As a user, I want to be notified when approaching my budget limit so that I can adjust spending.

**Acceptance Criteria:**
- [ ] Alert at 80% of budget (configurable)
- [ ] Alert at 100% of budget
- [ ] Alert displayed as in-app notification
- [ ] Alert shown only once per threshold per period
- [ ] Option to dismiss or snooze alert

**Story Points:** 5

---

#### US-3.2: Custom Alert Thresholds
> As a user, I want to set my own alert thresholds so that I can customize warnings.

**Acceptance Criteria:**
- [ ] Add multiple thresholds per budget (e.g., 50%, 75%, 90%)
- [ ] Each threshold can be enabled/disabled independently
- [ ] Default thresholds: 80%, 100%
- [ ] Validate threshold values (0-200%)

**Story Points:** 3

---

#### US-3.3: Transaction Budget Warning
> As a user, I want to see a warning when adding a transaction that exceeds remaining budget.

**Acceptance Criteria:**
- [ ] When entering transaction amount, show if it exceeds remaining budget
- [ ] Warning is non-blocking (user can still proceed)
- [ ] Show remaining budget for the transaction's category
- [ ] Show by how much it will exceed
- [ ] Option to proceed or cancel

**Story Points:** 3

---

### Epic 4: Savings Goals

#### US-4.1: Create Savings Goal
> As a user, I want to create a savings goal so that I can track progress toward a target.

**Acceptance Criteria:**
- [ ] Enter goal name (required, max 100 chars)
- [ ] Enter target amount (positive number)
- [ ] Enter target date (optional, must be future)
- [ ] Select icon and color
- [ ] Optionally link to a specific asset account
- [ ] Goal saved and appears in goals list

**Story Points:** 5

---

#### US-4.2: View Savings Goals
> As a user, I want to see all my savings goals so that I can track progress.

**Acceptance Criteria:**
- [ ] Display all goals in card/list format
- [ ] Show: name, icon, progress bar, current/target amounts
- [ ] Show days remaining (if target date set)
- [ ] Show required monthly contribution to meet target
- [ ] Sort by: progress %, target date, target amount

**Story Points:** 5

---

#### US-4.3: Contribute to Savings Goal
> As a user, I want to add contributions to my savings goal so that I can track deposits.

**Acceptance Criteria:**
- [ ] Add contribution with amount and date
- [ ] Contribution can be linked to an income transaction (optional)
- [ ] Running total updates automatically
- [ ] Contribution history viewable
- [ ] Option to edit/delete contributions

**Story Points:** 5

---

#### US-4.4: Update/Delete Savings Goal
> As a user, I want to modify or remove savings goals as my plans change.

**Acceptance Criteria:**
- [ ] Edit name, target amount, target date, icon, color
- [ ] Cannot edit past contributions (immutable)
- [ ] Delete with confirmation
- [ ] Option to mark as "achieved" vs "abandoned"
- [ ] Completed goals move to archive section

**Story Points:** 3

---

#### US-4.5: Dashboard Savings Widget
> As a user, I want to see my savings goals on the dashboard for quick visibility.

**Acceptance Criteria:**
- [ ] Show top 3 active goals by progress or target date
- [ ] Each shows: name, progress bar, current/target
- [ ] Celebrate when goal is achieved (confetti animation)
- [ ] Link to full goals list

**Story Points:** 3

---

### Epic 5: Budget Analytics

#### US-5.1: Budget vs Actual Report
> As a user, I want to compare my budgets against actual spending by period.

**Acceptance Criteria:**
- [ ] Table view: category, budget, actual, variance, % used
- [ ] Highlight over-budget categories in red
- [ ] Filter by period (month, quarter, year)
- [ ] Export to CSV/PDF
- [ ] Summary totals at bottom

**Story Points:** 5

---

#### US-5.2: Budget Trend Analysis
> As a user, I want to see how my budget performance changes over time.

**Acceptance Criteria:**
- [ ] Line chart showing budget adherence over 6-12 months
- [ ] Select specific category or view all
- [ ] Show average budget utilization percentage
- [ ] Identify months with highest overages

**Story Points:** 5

---

#### US-5.3: Category Budget Recommendations
> As a user, I want AI-suggested budget amounts based on my spending history.

**Acceptance Criteria:**
- [ ] Analyze last 3-6 months of spending per category
- [ ] Suggest budget = average + 10% buffer
- [ ] User can accept, modify, or dismiss suggestion
- [ ] Suggestions shown during budget creation
- [ ] Explain reasoning ("Based on your average of $X")

**Story Points:** 8

---

### Epic 6: Settings & Configuration

#### US-6.1: Budget Period Settings
> As a user, I want to configure when my budget periods start.

**Acceptance Criteria:**
- [ ] Set custom month start day (default: 1)
- [ ] Useful for pay-cycle alignment
- [ ] All monthly budgets respect this setting
- [ ] Clear label showing current period dates

**Story Points:** 3

---

#### US-6.2: Default Budget Currency
> As a user with multi-currency assets, I want to set a default budget currency.

**Acceptance Criteria:**
- [ ] All budgets use this currency
- [ ] Transactions in other currencies converted using rates
- [ ] Currency symbol displayed consistently
- [ ] Warning if transaction currency differs

**Story Points:** 3

---

#### US-6.3: Budget Visibility Toggle
> As a user, I want to hide/show the budget widget on dashboard.

**Acceptance Criteria:**
- [ ] Toggle in settings or dashboard edit mode
- [ ] Preference persisted per user
- [ ] Default: shown

**Story Points:** 2

---

## 4. Data Models

### 4.1 Budget Schema

```typescript
// budgets
{
  id: string           // Auto-generated, 15 chars
  category: relation   // -> categories (expenses only)
  amount: number       // Budget limit
  period: 'monthly' | 'quarterly' | 'yearly'
  rollover_enabled: boolean
  rollover_cap: number // Max rollover (percentage of amount), default 100
  start_day: number    // Day of month budget starts, default 1
  alert_thresholds: number[] // e.g., [80, 100]
  is_active: boolean   // Soft delete flag
  created: datetime
  updated: datetime
}
```

### 4.2 Budget Period History Schema

```typescript
// budget_periods
{
  id: string
  budget: relation     // -> budgets
  period_start: date   // Start of this budget period
  period_end: date     // End of this budget period
  base_amount: number  // Original budget for this period
  rollover_amount: number // Rolled over from previous
  total_amount: number // base + rollover
  spent_amount: number // Calculated from transactions
  created: datetime
}
```

### 4.3 Savings Goal Schema

```typescript
// savings_goals
{
  id: string
  name: string
  icon: string
  color: string
  target_amount: number
  current_amount: number  // Sum of contributions
  target_date: date       // Optional
  linked_asset: relation  // -> assets, optional
  status: 'active' | 'achieved' | 'abandoned'
  created: datetime
  updated: datetime
}
```

### 4.4 Savings Contribution Schema

```typescript
// savings_contributions
{
  id: string
  goal: relation         // -> savings_goals
  amount: number
  date: date
  transaction: relation  // -> transactions, optional
  note: string
  created: datetime
}
```

---

## 5. API Endpoints

### 5.1 Budget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budgets/list` | List all budgets with current period data |
| POST | `/budgets/create` | Create new budget |
| PATCH | `/budgets/update/:id` | Update budget settings |
| DELETE | `/budgets/delete/:id` | Soft delete budget |
| GET | `/budgets/details/:id` | Get budget with transactions |
| GET | `/budgets/summary` | Dashboard summary widget data |
| GET | `/budgets/recommendations` | AI-suggested budget amounts |

### 5.2 Budget Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budgets/analytics/vs-actual` | Budget vs actual by period |
| GET | `/budgets/analytics/trends` | Budget trends over time |
| GET | `/budgets/analytics/alerts` | Pending/triggered alerts |

### 5.3 Savings Goal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/savings/list` | List all savings goals |
| POST | `/savings/create` | Create new goal |
| PATCH | `/savings/update/:id` | Update goal |
| DELETE | `/savings/delete/:id` | Delete goal |
| POST | `/savings/:id/contribute` | Add contribution |
| DELETE | `/savings/contributions/:id` | Remove contribution |
| GET | `/savings/summary` | Dashboard summary data |

---

## 6. UI/UX Specifications

### 6.1 New Pages/Routes

| Route | Page | Description |
|-------|------|-------------|
| `/wallet/budgets` | Budget List | Main budget management page |
| `/wallet/budgets/:id` | Budget Detail | Individual budget view |
| `/wallet/savings` | Savings Goals | Savings goal management |
| `/wallet/savings/:id` | Goal Detail | Individual goal view |

### 6.2 Dashboard Widgets

#### Budget Overview Widget
```
┌──────────────────────────────────────┐
│ 📊 Budgets                    View → │
├──────────────────────────────────────┤
│ 🍔 Food & Dining                     │
│ ████████████░░░░ $340 / $400   85%   │
│                                      │
│ 🚗 Transportation                    │
│ ██████████░░░░░░ $125 / $200   62%   │
│                                      │
│ 🎮 Entertainment                     │
│ ██████████████████ $180 / $150  120% │
└──────────────────────────────────────┘
```

#### Savings Goals Widget
```
┌──────────────────────────────────────┐
│ 🎯 Savings Goals              View → │
├──────────────────────────────────────┤
│ 🏖️ Vacation Fund                     │
│ ██████████░░░░░░ $2,400 / $4,000     │
│ 47 days left                         │
│                                      │
│ 💻 New Laptop                        │
│ ████████████████ $1,800 / $2,000     │
│ Almost there! 🎉                     │
└──────────────────────────────────────┘
```

### 6.3 Modals

| Modal | Purpose |
|-------|---------|
| CreateBudgetModal | New budget form |
| ModifyBudgetModal | Edit existing budget |
| BudgetAlertSettings | Configure thresholds |
| CreateSavingsGoalModal | New savings goal |
| ContributionModal | Add contribution |
| DeleteConfirmationModal | Confirm deletions |

### 6.4 Color System

| State | Color | Usage |
|-------|-------|-------|
| Under Budget (< 80%) | `#22c55e` (green) | Progress bar, text |
| Warning (80-99%) | `#eab308` (yellow) | Progress bar, text |
| Over Budget (≥ 100%) | `#ef4444` (red) | Progress bar, text |
| Goal Achieved | `#8b5cf6` (purple) | Celebration state |

---

## 7. Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Performance | Budget widget loads < 200ms |
| Scalability | Support 100+ budgets per user |
| Accessibility | WCAG 2.1 AA compliance |
| Localization | All strings translatable (en, ms, zh-CN, zh-TW) |
| Offline | Show cached budget data when offline |
| Mobile | Fully responsive, touch-friendly |

---

## 8. Sprint Backlog (Suggested)

### Sprint 1: Core Budget CRUD (2 weeks)
- US-1.1 Create Category Budget
- US-1.2 View Budget List
- US-1.3 Update Budget
- US-1.4 Delete Budget
- Data models & migrations
- Basic API endpoints

### Sprint 2: Tracking & Visualization (2 weeks)
- US-2.1 Dashboard Budget Widget
- US-2.2 Budget Progress Bars
- US-2.3 Budget Detail View
- US-2.4 Period-Based Tracking

### Sprint 3: Alerts & Rollover (1.5 weeks)
- US-2.5 Budget Rollover
- US-3.1 Budget Threshold Alerts
- US-3.2 Custom Alert Thresholds
- US-3.3 Transaction Budget Warning

### Sprint 4: Savings Goals (2 weeks)
- US-4.1 Create Savings Goal
- US-4.2 View Savings Goals
- US-4.3 Contribute to Goal
- US-4.4 Update/Delete Goal
- US-4.5 Dashboard Widget

### Sprint 5: Analytics & Polish (2 weeks)
- US-5.1 Budget vs Actual Report
- US-5.2 Budget Trend Analysis
- US-6.1 Period Settings
- US-6.2 Currency Settings
- US-6.3 Visibility Toggle

### Sprint 6: AI & Enhancement (1 week)
- US-5.3 Category Budget Recommendations
- Performance optimization
- Bug fixes & QA

---

## 9. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| categories | Existing | Budgets link to expense categories |
| transactions | Existing | Calculate spent amounts |
| Notification system | New/Existing | For budget alerts |
| React Query | Existing | Data fetching |
| Recharts | Existing | Charts and graphs |

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex period calculations | High | Use moment.js/date-fns, comprehensive tests |
| Multi-currency complexity | Medium | Defer to Phase 2 if needed |
| Performance with many transactions | Medium | Use aggregated views, caching |
| Alert notification delivery | Low | Start with in-app only |

---

## 11. Out of Scope (v1.0)

- Shared/family budgets
- Bank account sync
- Bill payment reminders (separate feature)
- Investment tracking budgets
- Email/push notifications (in-app only for v1)

---

## Appendix: Acceptance Test Scenarios

### AT-1: End-to-End Budget Creation
1. Navigate to Budgets page
2. Click "Create Budget"
3. Select "Food & Dining" category
4. Enter $400 monthly budget
5. Enable rollover
6. Save → Verify appears in list with 0% progress

### AT-2: Budget Threshold Alert
1. Create budget for $100
2. Add transactions totaling $82
3. Verify 80% alert triggered
4. Add transaction for $20
5. Verify 100% alert triggered

### AT-3: Savings Goal Completion
1. Create goal for $1,000
2. Add contribution of $1,000
3. Verify goal marked as "achieved"
4. Verify confetti celebration displayed
5. Verify goal moves to completed section
