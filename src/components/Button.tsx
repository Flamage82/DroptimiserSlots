import classNames from 'classnames'
import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type ButtonProperties = ButtonHTMLAttributes<HTMLButtonElement>

const Button = forwardRef<HTMLButtonElement, ButtonProperties>(
	({ className, children, ...properties }, reference) => (
		<button
			type='button'
			className={classNames(
				'hover:bg-blue-700-hover rounded bg-blue-700 px-[22px] py-2.5 font-medium text-white sm:px-[15px] sm:py-[9px]',
				'focus:border-focused focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-blue-700',
				'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300',
				className
			)}
			ref={reference}
			{...properties}
		>
			{children}
		</button>
	)
)
Button.displayName = 'Button'

export default Button
