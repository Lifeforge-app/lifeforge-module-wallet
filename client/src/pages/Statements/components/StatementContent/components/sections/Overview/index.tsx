import AssetsTable from './components/AssetsTable'
import IncomeExpensesTable from './components/IncomeExpensesTable'
import OverviewSummary from './components/OverviewSummary'

function Overview({ month, year }: { month: number; year: number }) {
  return (
    <>
      <h2 className="mt-16 text-3xl font-semibold tracking-widest uppercase print:text-[24px]">
        <span className="text-custom-500 print:text-lime-600">01. </span>
        Overview
      </h2>
      <OverviewSummary month={month} year={year} />
      <h2 className="mt-16 text-2xl font-semibold tracking-widest uppercase print:text-[18px]">
        <span>1.1 </span>
        Assets
      </h2>
      <AssetsTable month={month} year={year} />
      {(['income', 'expenses'] as const).map(type => (
        <IncomeExpensesTable key={type} month={month} type={type} year={year} />
      ))}
    </>
  )
}

export default Overview
