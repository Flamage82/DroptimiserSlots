import { groupBy, mapValues, orderBy, toPairs } from 'lodash'
import { useCallback, useMemo, useState, type ReactNode } from 'react'

export interface RaidBotsReport {
	sim: {
		profilesets: {
			results: {
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
				icon: string
				instance: {
					encounters: {
						id: number
						name: string
					}[]
				}
			}[]
		}
		simType: string
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

		const groupedSlots = toPairs(
			mapValues(
				groupBy(items, r => r.slot),
				slot => orderBy(slot, r => r.item.mean, 'desc')
			)
		)

		const filteredSlots = groupedSlots.map(
			([slot, groupedSlotItems]) =>
				[
					slot,
					slot.endsWith('2')
						? groupedSlotItems.filter(
								item =>
									item.itemId !==
									groupedSlots.find(
										([otherSlot]) => otherSlot === `${slot.slice(0, -1)}1`
									)?.[1][0].itemId
							)
						: groupedSlotItems
				] as const
		)

		const newSlots = orderBy(
			filteredSlots,
			([, groupedSlotItems]) =>
				orderByBoss
					? groupedSlotItems[0].itemDetails?.instance.encounters.find(
							encounter =>
								encounter.id.toString() === groupedSlotItems[0].encounterId
						)?.id
					: groupedSlotItems[0].item.mean,
			orderByBoss ? 'asc' : 'desc'
		)
		return newSlots
	}, [report, orderByBoss])

	const onChange = useCallback(
		() => setOrderByBoss(!orderByBoss),
		[orderByBoss]
	)

	return (
		<div className='mt-4'>
			<div className='mb-4'>
				<label htmlFor='sortByBoss'>
					Sort by boss:
					<input
						className='ml-2'
						id='sortByBoss'
						type='checkbox'
						checked={orderByBoss}
						onChange={onChange}
					/>
				</label>
			</div>
			{slots.map(([name, items]) => (
				<div className='my-1 flex items-center gap-4' key={name}>
					<div className='w-32 flex-none'>{name}</div>
					<div className='w-[384px] flex-none'>
						<a
							href={`https://www.wowhead.com/item=${items[0].itemId}`}
							className='q3'
							data-wowhead={`ilvl=${items[0].ilvl}`}
						>
							<img
								alt=''
								className='mr-2 inline'
								src={`https://wow.zamimg.com/images/wow/icons/medium/${items[0].itemDetails?.icon}.jpg`}
							/>
							{items[0].itemDetails?.name}
						</a>
					</div>
					<div className='w-32 flex-none text-right'>
						{(
							items[0].item.mean - report.sim.statistics.raid_dps.mean
						).toLocaleString(undefined, { maximumFractionDigits: 0 })}{' '}
						dps
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
