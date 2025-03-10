import Button from 'components/Button'
import type { ChangeEvent, ReactNode } from 'react'
import { useCallback, useState } from 'react'

const regex =
	/(?:https:\/\/www\.raidbots\.com\/simbot\/report\/)?(?<hash>[\dA-Za-z]{22})/

export default function Report(): ReactNode {
	const [reportUrl, setReportUrl] = useState(
		'https://www.raidbots.com/simbot/report/jxmyHRqGFghsshiFAeUXn8'
	)

	const onClick = useCallback(() => {
		const matches = regex.exec(reportUrl)
		// eslint-disable-next-line no-console
		console.log(matches?.groups?.hash)
	}, [reportUrl])

	const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setReportUrl(event.target.value)
	}, [])

	return (
		<div className='m-2 flex w-auto gap-2'>
			<label className='' htmlFor='report'>
				Report URL:
				<input
					className='ml-2 w-[600px]'
					id='report'
					type='text'
					placeholder='Type something...'
					value={reportUrl}
					onChange={onChange}
				/>
			</label>
			<Button type='button' onClick={onClick}>
				Load
			</Button>
		</div>
	)
}
