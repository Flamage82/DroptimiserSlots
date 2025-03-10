import classNames from 'classnames'
import type { ChangeEvent, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { NavLink } from 'react-router-dom'

const reportUrlRegex =
	/^(?:https:\/\/www\.raidbots\.com\/simbot\/report\/)?(?<hash>[\dA-Za-z]{22})$/

export default function ReportSelector(): ReactNode {
	const [reportUrl, setReportUrl] = useState(
		'https://www.raidbots.com/simbot/report/jxmyHRqGFghsshiFAeUXn8'
	)

	// const [slots, setSlots] = useState<[string, Item[]][]>()

	const reportHash = reportUrlRegex.exec(reportUrl)?.groups?.hash

	// const onClick = useCallback(async () => {
	// 	if (!isValid)
	// 		return

	// 	const matches = reportUrlRegex.exec(reportUrl)
	// 	const hash = matches?.groups?.hash

	// 	const response = await fetch(`https://www.raidbots.com/reports/${hash}/data.json`)

	// 	const result = await response.json() as RaidBotsReport

	// 	const items = result.sim.profilesets.results.map(r => {
	// 		const itemMatches = itemRegex.exec(r.name)
	// 		return {
	// 			...itemMatches?.groups as unknown as ItemRegexGroups,
	// 			item: r
	// 		}
	// 	})

	// 	const newSlots: [string, Item[]][] = orderBy(toPairs(mapValues(groupBy(items, r => r.slot), slot => orderBy(slot, r => r.item.mean, 'desc'))), ([, groupedSlotItems]) => groupedSlotItems[0].item.mean, 'desc')
	// 	setSlots(newSlots)
	// }, [isValid, reportUrl])

	const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setReportUrl(event.target.value)
	}, [])

	return (
		<div className='m-2 flex w-auto gap-2'>
			<label className='' htmlFor='report'>
				Report URL:
				<input
					className={classNames(
						'ml-2 w-[600px]',
						reportUrl.length > 0 && !reportHash && 'border-red-500'
					)}
					id='report'
					type='text'
					placeholder='Type something...'
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
	)
}
