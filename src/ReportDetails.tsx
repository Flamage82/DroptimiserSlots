import { groupBy, mapValues, orderBy, toPairs } from 'lodash'
import { useMemo, type ReactNode } from 'react'
import type { RaidBotsReport } from 'ReportLoader'

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

type Item = ItemRegexGroups & {
	item: {
		name: string
		mean: number
	}
}

export default function ReportDetails({
	report
}: {
	report: RaidBotsReport
}): ReactNode {
	const data = useMemo(() => {
		const items = report.sim.profilesets.results.map(r => {
			const itemMatches = itemRegex.exec(r.name)
			return {
				...(itemMatches?.groups as unknown as ItemRegexGroups),
				item: r
			}
		})

		const newSlots: [string, Item[]][] = orderBy(
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
	}, [report.sim.profilesets.results])

	console.log(data)

	return 'dfs'
}
