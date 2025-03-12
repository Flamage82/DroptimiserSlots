import LoadingOrError from 'components/LoadingOrError'
import type { ReactElement } from 'react'
import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReportSelector from 'ReportSelector'

export default function App(): ReactElement {
	return (
		<BrowserRouter>
			<Suspense fallback={<LoadingOrError />}>
				<Routes>
					<Route path=':reportHash?' element={<ReportSelector />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	)
}
