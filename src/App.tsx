import LoadingOrError from 'components/LoadingOrError'
import type { ReactElement } from 'react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const ReportSelector = lazy(async () => import('ReportSelector'))
const ReportLoader = lazy(async () => import('ReportLoader'))

export default function App(): ReactElement {
	return (
		<BrowserRouter>
			<Suspense fallback={<LoadingOrError />}>
				<Routes>
					<Route path='/' element={<ReportSelector />} />
					<Route path=':reportHash' element={<ReportLoader />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	)
}
