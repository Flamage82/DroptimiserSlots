import { groupBy, mapValues, orderBy, toPairs } from 'lodash'
import { useCallback, useMemo, useState, type ReactNode } from 'react'

export interface RaidBotsReport {
	sim: {
		profilesets: {
			results: {
				// id: number
				name: string
				mean: number
			}[]
		}
		statistics: {
			raid_dps: {
				mean: number
			}
		}
	}
	simbot: {
		meta: {
			itemLibrary: {
				id: number
				name: string
				instance: {
					encounters: {
						id: number
						name: string
					}[]
				}
			}[]
		}
	}
}

const itemRegex =
	/^(?<instanceId>[^/\\]*)\/(?<encounterId>[^/\\]*)\/(?<difficulty>[^/\\]*)\/(?<itemId>[^/\\]*)\/(?<ilvl>[^/\\]*)\/(?<enchantId>[^/\\]*)\/(?<slot>[^/\\]*)/

interface ItemRegexGroups {
	instanceId: string
	encounterId: string
	difficulty: string
	itemId: string
	ilvl: string
	enchantId: string
	slot: string
}

export default function ReportDetails({
	report
}: {
	report: RaidBotsReport
}): ReactNode {
	const [orderByBoss, setOrderByBoss] = useState(false)

	const slots = useMemo(() => {
		const items = report.sim.profilesets.results.map(r => {
			const itemMatches = itemRegex.exec(r.name)
			return {
				...(itemMatches?.groups as unknown as ItemRegexGroups),
				item: r,
				itemDetails: report.simbot.meta.itemLibrary.find(
					item => item.id.toString() === itemMatches?.groups?.itemId
				)
			}
		})

		const newSlots = orderBy(
			toPairs(
				mapValues(
					groupBy(items, r => r.slot),
					slot => orderBy(slot, r => r.item.mean, 'desc')
				)
			),
			([, groupedSlotItems]) => groupedSlotItems[0].item.mean,
			'desc'
		)
		return newSlots
	}, [report])

	const onChange = useCallback(
		() => setOrderByBoss(!orderByBoss),
		[orderByBoss]
	)

	return (
		<div>
			<label htmlFor='sortByBoss'>
				Sort by boss:
				<input
					id='sortByBoss'
					type='checkbox'
					checked={orderByBoss}
					onChange={onChange}
				/>
			</label>
			{slots.map(([name, items]) => (
				<div className='flex' key={name}>
					<div className='w-64 flex-none'>{name}</div>
					<div className='w-64 flex-none'>
						<a
							href={`https://www.wowhead.com/item=${items[0].itemId}`}
							className='q3'
							data-wowhead={`ilvl=${items[0].ilvl}`}
						>
							{items[0].itemDetails?.name}
						</a>
					</div>
					<div className='w-64 flex-none'>
						{items[0].item.mean - report.sim.statistics.raid_dps.mean}
					</div>
					<div className='w-64 flex-none'>
						{
							items[0].itemDetails?.instance.encounters.find(
								encounter => encounter.id.toString() === items[0].encounterId
							)?.name
						}
					</div>
				</div>
			))}
		</div>
	)
}
