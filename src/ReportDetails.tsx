import { groupBy, mapValues, orderBy, toPairs } from 'lodash'
import type { ChangeEvent, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

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
		players: {
			gear: Record<string, unknown>
		}[]
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

type SortByOptions = 'boss' | 'dps' | 'slot'

const sortByOptions = [
	{
		label: 'DPS',
		value: 'dps'
	},
	{
		label: 'Boss',
		value: 'boss'
	},
	{
		label: 'Slot',
		value: 'slot'
	}
]

const slotOrder: Record<string, number> = {
	main_hand: 1,
	off_hand: 2,
	head: 3,
	neck: 4,
	shoulder: 5,
	back: 6,
	chest: 7,
	wrist: 8,
	hands: 9,
	waist: 10,
	legs: 11,
	feet: 12,
	finger1: 13,
	finger2: 14,
	trinket1: 15,
	trinket2: 16
}

export default function ReportDetails({
	report
}: {
	report: RaidBotsReport
}): ReactNode {
	const [sortBy, setSortBy] = useState<SortByOptions>('dps')

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

		switch (sortBy) {
			case 'dps': {
				return orderBy(
					filteredSlots,
					([, groupedSlotItems]) => groupedSlotItems[0].item.mean,
					'desc'
				)
			}
			case 'slot': {
				return orderBy(filteredSlots, ([slot]) => slotOrder[slot], 'asc')
			}
			case 'boss': {
				return orderBy(
					filteredSlots,
					([, groupedSlotItems]) =>
						groupedSlotItems[0].itemDetails?.instance.encounters.find(
							encounter =>
								encounter.id.toString() === groupedSlotItems[0].encounterId
						)?.id,
					'asc'
				)
			}
			default: {
				throw new Error(`Unknown sortBy option`)
			}
		}
	}, [report, sortBy])

	const onChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setSortBy(event.target.value as SortByOptions),
		[setSortBy]
	)

	return (
		<div className='mt-4'>
			<div className='mb-4 flex items-center'>
				Sort by:
				{sortByOptions.map(option => (
					<label htmlFor={option.value} key={option.value}>
						<input
							className='mb-1 ml-4 mr-1'
							id={option.value}
							name='sortBy'
							type='radio'
							value={option.value}
							checked={sortBy === option.value}
							onChange={onChange}
						/>
						{option.label}
					</label>
				))}
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
