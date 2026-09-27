import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  LogarithmicScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import {
  ContextMenu,
  ContextMenuItem,
  Grid,
  ModuleHeader
} from '@lifeforge/ui'

import { useWalletStore } from '@/stores/useWalletStore'

import TransactionCreationMenu from '../Transactions/components/TransactionCreationMenu'

import AssetsBalanceCard from './components/AssetsBalanceCard'
import CategoriesBreakdownCard from './components/CategoriesBreakdownCard'
import IncomeExpenseCard from './components/IncomeExpensesCard'
import StatisticChardCard from './components/StatisticChartCard'
import TransactionsCard from './components/TransactionsCard'
import TransactionsCountCard from './components/TransactionsCountCard'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LogarithmicScale
)

function WalletDashboard() {
  const { isAmountHidden, toggleAmountVisibility } = useWalletStore()

  return (
    <>
      <ModuleHeader
        trailing={
          <>
            <TransactionCreationMenu mode="navigate" variant="desktop" />
            <ContextMenu>
              <ContextMenuItem
                checked={isAmountHidden}
                icon="tabler:eye-off"
                label="Hide Amount"
                onClick={() => {
                  toggleAmountVisibility()
                }}
              />
            </ContextMenu>
          </>
        }
      />
      <Grid gap="sm" pb="2xl" templateCols={{ base: 1, xl: 3 }} width="100%">
        <IncomeExpenseCard icon="tabler:login-2" title="Income" />
        <IncomeExpenseCard icon="tabler:logout-2" title="Expenses" />
        <AssetsBalanceCard />
        <StatisticChardCard />
        <TransactionsCountCard />
        <TransactionsCard />
        <CategoriesBreakdownCard />
      </Grid>
      <TransactionCreationMenu mode="navigate" variant="mobile" />
    </>
  )
}

export default WalletDashboard
