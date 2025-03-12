import LoadingOrError from 'components/LoadingOrError'
import { useEffect, useState, type ReactNode } from 'react'
import type { RaidBotsReport } from 'ReportDetails'
import ReportDetails from 'ReportDetails'

export default function ReportLoader({
	reportHash
}: {
	reportHash: string
}): ReactNode {
	const [report, setReport] = useState<RaidBotsReport>()

	useEffect(() => {
		async function fetchReport(): Promise<void> {
			const response = await fetch(
				`https://www.raidbots.com/reports/${reportHash}/data.json`
			)
			const json = (await response.json()) as RaidBotsReport
			setReport(json)
		}

		void fetchReport()
	}, [reportHash])

	if (!report) return <LoadingOrError />

	if (report.simbot.simType !== 'droptimizer') return 'Not a droptimizer report'

	return <ReportDetails report={report} />
}
