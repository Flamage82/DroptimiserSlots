import classNames from 'classnames'
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

const slotOrder: Record<string, { index: number; label: string }> = {
	main_hand: { index: 1, label: 'Main Hand' },
	off_hand: { index: 2, label: 'Off Hand' },
	head: { index: 3, label: 'Head' },
	neck: { index: 4, label: 'Neck' },
	shoulder: { index: 5, label: 'Shoulder' },
	back: { index: 6, label: 'Back' },
	chest: { index: 7, label: 'Chest' },
	wrist: { index: 8, label: 'Wrist' },
	hands: { index: 9, label: 'Hands' },
	waist: { index: 10, label: 'Waist' },
	legs: { index: 11, label: 'Legs' },
	feet: { index: 12, label: 'Feet' },
	finger1: { index: 13, label: 'Finger 1' },
	finger2: { index: 14, label: 'Finger 2' },
	trinket1: { index: 15, label: 'Trinket 1' },
	trinket2: { index: 16, label: 'Trinket 2' }
}

export default function ReportDetails({
	report
}: {
	report: RaidBotsReport
}): ReactNode {
	const [sortBy, setSortBy] = useState<SortByOptions>('dps')

	const slots = useMemo(() => {
		const items = report.sim.profilesets.results
			.map(r => {
				const itemMatches = itemRegex.exec(r.name)
				return {
					...(itemMatches?.groups as unknown as ItemRegexGroups),
					dpsChange: r.mean - report.sim.statistics.raid_dps.mean,
					itemDetails: report.simbot.meta.itemLibrary.find(
						item => item.id.toString() === itemMatches?.groups?.itemId
					)
				}
			})
			.map(item => {
				const { itemDetails, ...rest } = item
				return {
					...rest,
					name: itemDetails?.name,
					icon: itemDetails?.icon,
					encounter: itemDetails?.instance.encounters.find(
						encounter => encounter.id.toString() === item.encounterId
					)
				}
			})

		const groupedSlots = toPairs(
			mapValues(
				groupBy(items, item => item.slot),
				slot => orderBy(slot, r => r.dpsChange, 'desc')
			)
		)

		const filteredSlots = groupedSlots
			.map(([slot, groupedSlotItems]) => [
				slot,
				slot.endsWith('2')
					? groupedSlotItems.find(
							item =>
								item.itemId !==
								groupedSlots.find(
									([otherSlot]) => otherSlot === `${slot.slice(0, -1)}1`
								)?.[1][0].itemId
						)
					: groupedSlotItems[0]
			])
			.filter(([, item]) => item) as [string, (typeof groupedSlots)[0][1][0]][]

		switch (sortBy) {
			case 'dps': {
				return orderBy(
					filteredSlots,
					([, groupedSlotItems]) => groupedSlotItems.dpsChange,
					'desc'
				)
			}
			case 'slot': {
				return orderBy(filteredSlots, ([slot]) => slotOrder[slot].index, 'asc')
			}
			case 'boss': {
				return orderBy(
					filteredSlots,
					([, groupedSlotItems]) => groupedSlotItems.encounter?.id,
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
			{slots.map(([name, item]) => (
				<div className='my-1 flex items-center gap-4' key={name}>
					<div className='w-32 flex-none'>{slotOrder[item.slot].label}</div>
					<div className='w-[384px] flex-none'>
						<a
							target='_blank'
							href={`https://www.wowhead.com/item=${item.itemId}`}
							className='q3'
							data-wowhead={`ilvl=${item.ilvl}`}
							rel='noreferrer'
						>
							<img
								alt=''
								className='mr-2 inline'
								src={`https://wow.zamimg.com/images/wow/icons/medium/${item.icon}.jpg`}
							/>
							{item.name}
						</a>
					</div>
					<div
						className={classNames(
							'w-32 flex-none text-right',
							item.dpsChange <= 0 && 'text-red-500'
						)}
					>
						{item.dpsChange > 0 ? '+' : ''}
						{item.dpsChange.toLocaleString(undefined, {
							maximumFractionDigits: 0
						})}{' '}
						dps
					</div>
					<div className='w-64 flex-none'>{item.encounter?.name}</div>
				</div>
			))}
		</div>
	)
}
