import { EmptyStateScreen, LoadingScreen, ModuleHeader } from 'lifeforge-ui'
import { useRef, useState } from 'react'

import YearMonthInput from '@/components/YearMonthInput'
import useYearMonthState from '@/hooks/useYearMonthState'
import forgeAPI from '@/utils/forgeAPI'

import '../../index.css'
import PrintAndViewButton from './components/PrintAndViewButton'
import StatementContent from './components/StatementContent'

function Statements() {
  const {
    yearMonth: { year, month },
    setYearMonth,
    options: { years: yearsOptions, months: monthsOptions },
    isLoading
  } = useYearMonthState(forgeAPI.analytics.getAvailableYearMonths)

  const [showStatement, setShowStatement] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <ModuleHeader
        icon="tabler:file-text"
        namespace="apps.wallet"
        title="Financial Statements"
        tKey="subsectionsTitleAndDesc"
      />
      {isLoading ? (
        <LoadingScreen />
      ) : yearsOptions.length === 0 && monthsOptions.length === 0 ? (
        <EmptyStateScreen
          icon="tabler:report-off"
          message={{
            id: 'statements',
            namespace: 'apps.wallet'
          }}
        />
      ) : (
        <>
          <YearMonthInput
            className="mb-6"
            month={month}
            monthsOptions={monthsOptions}
            setMonth={(month: number | null) => setYearMonth({ month })}
            setYear={(year: number | null) => setYearMonth({ year })}
            year={year}
            yearsOptions={yearsOptions}
          />
          {year !== null && month !== null && (
            <>
              <PrintAndViewButton
                contentRef={contentRef}
                setShowStatement={setShowStatement}
                showStatement={showStatement}
              />
              <StatementContent
                contentRef={contentRef}
                month={month}
                showStatement={showStatement}
                year={year}
              />
            </>
          )}
        </>
      )}
    </>
  )
}

export default Statements
