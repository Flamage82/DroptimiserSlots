import classNames from 'classnames'
import type { ChangeEvent, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import ReportLoader from 'ReportLoader'

const reportUrlRegex =
	/^(?:https:\/\/www\.raidbots\.com\/simbot\/report\/)?(?<hash>[\dA-Za-z]{22})$/

interface LoaderParameters extends Record<string, string | undefined> {
	reportHash: string
}

export default function ReportSelector(): ReactNode {
	const { reportHash: reportHashParameter } = useParams<LoaderParameters>()

	const [reportUrl, setReportUrl] = useState(
		reportHashParameter
			? `https://www.raidbots.com/simbot/report/${reportHashParameter}`
			: ''
	)

	const reportHash = reportUrlRegex.exec(reportUrl)?.groups?.hash

	const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setReportUrl(event.target.value)
	}, [])

	return (
		<div className='m-2'>
			<div className='flex w-auto gap-2'>
				<label className='' htmlFor='report'>
					Report URL:
					<input
						className={classNames(
							'ml-2 w-[600px]',
							reportUrl.length > 0 && !reportHash && 'border-red-500'
						)}
						id='report'
						type='text'
						placeholder='https://www.raidbots.com/simbot/report/...'
						value={reportUrl}
						onChange={onChange}
					/>
				</label>
				<NavLink
					className={classNames(
						'hover:bg-blue-700-hover rounded bg-blue-700 px-[22px] py-2.5 font-medium text-white sm:px-[15px] sm:py-[9px]',
						'focus:border-focused focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-blue-700',
						'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300'
					)}
					to={reportHash ? `/${reportHash}` : '/'}
					type='button'
				>
					Load
				</NavLink>
			</div>
			{reportHashParameter ? (
				<ReportLoader reportHash={reportHashParameter} />
			) : undefined}
		</div>
	)
}
