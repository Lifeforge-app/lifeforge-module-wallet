import clsx from 'clsx'

import StatementEndedText from '../StatementEndedText'
import StatementHeader from './components/StatementHeader'
import Overview from './components/sections/Overview'
import Transactions from './components/sections/Transactions'

function StatementContent({
  contentRef,
  showStatement,
  month,
  year
}: {
  contentRef: React.RefObject<HTMLDivElement | null>
  showStatement: boolean
  month: number
  year: number
}) {
  return (
    <div
      ref={contentRef}
      className={clsx(
        'print-area relative my-6 flex h-0 w-full min-w-0 flex-col overflow-hidden font-[Onest] transition-all duration-500 [interpolate-size:allow-keywords] print:m-24 print:bg-white print:text-black print:shadow-none print:[--radius-2xl:1rem] print:[--radius-3xl:1.5rem] print:[--radius-lg:0.5rem] print:[--radius-md:0.375rem] print:[--radius-sm:0.125rem] print:[--radius-xl:0.75rem] print:**:[--spacing:0.25rem]',
        !showStatement ? 'h-0 print:h-auto' : 'h-full! duration-[1.5s]'
      )}
    >
      <div className="size-full min-w-0">
        <StatementHeader month={month} year={year} />
        <Overview month={month} year={year} />
        <Transactions month={month} year={year} />
        <StatementEndedText />
      </div>
    </div>
  )
}

export default StatementContent
