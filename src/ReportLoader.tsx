import LoadingOrError from 'components/LoadingOrError'
import { useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import ReportDetails from 'ReportDetails'

interface LoaderParameters extends Record<string, string | undefined> {
	reportHash: string
}

export interface RaidBotsReport {
	sim: {
		profilesets: {
			results: {
				name: string
				mean: number
			}[]
		}
	}
}

export default function ReportLoader(): ReactNode {
	const { reportHash } = useParams<LoaderParameters>()

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

	return report ? <ReportDetails report={report} /> : <LoadingOrError />
}
