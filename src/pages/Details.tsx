import {Star} from 'lucide-react'
import {useCallback} from 'react'
import {Link, Navigate, useParams} from 'react-router'
import {useFruits} from '@/api/fruits'
import {Head} from '@/components/Head'
import {ImageAttribution} from '@/components/ImageAttribution'
import {LoadingOrError} from '@/components/LoadingOrError'
import {
	selectIsFavoriteFruit,
	toggleFavoriteFruit
} from '@/store/fruitPreferencesSlice'
import {useAppDispatch, useAppSelector} from '@/store/hooks'
import {useMediaQuery} from '@/utils/useMediaQuery'

const DESKTOP_IMAGE_WIDTH_PERCENTAGE = 0.4
const MOBILE_IMAGE_HEIGHT_PERCENTAGE = 0.3

interface FavoriteFruitButtonProperties {
	fruitName: string
	isFavorite: boolean
}

function FavoriteFruitButton({
	fruitName,
	isFavorite
}: FavoriteFruitButtonProperties) {
	const dispatch = useAppDispatch()
	const handleToggleFavorite = useCallback(() => {
		dispatch(toggleFavoriteFruit(fruitName))
	}, [dispatch, fruitName])

	return (
		<button
			aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
			aria-pressed={isFavorite}
			className='inline-flex size-12 items-center justify-center rounded-md border border-gray-300 text-gray-700 transition hover:bg-gray-100 focus:outline-3 focus:outline-gray-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
			onClick={handleToggleFavorite}
			type='button'
		>
			<Star
				aria-hidden={true}
				className={isFavorite ? 'fill-yellow-400 text-yellow-500' : undefined}
				size={24}
			/>
		</button>
	)
}

export function Details() {
	const isTabletAndUp = useMediaQuery('(min-width: 600px)')
	const {fruitName} = useParams()

	const data = useFruits()
	const fruit = data?.find(
		f => f.name.toLowerCase() === fruitName?.toLowerCase()
	)
	const isFavorite = useAppSelector(state =>
		fruit ? selectIsFavoriteFruit(state, fruit.name) : false
	)

	if (!data) {
		return <LoadingOrError />
	}

	if (!fruit) {
		return <Navigate replace={true} to='/' />
	}

	const imageWidth = isTabletAndUp
		? window.innerWidth * DESKTOP_IMAGE_WIDTH_PERCENTAGE
		: window.innerWidth
	const imageHeight = isTabletAndUp
		? window.innerHeight
		: window.innerHeight * MOBILE_IMAGE_HEIGHT_PERCENTAGE

	return (
		<>
			<Head title={fruit.name} />
			<div className='flex min-h-screen flex-col items-center sm:flex-row'>
				<div className='relative'>
					<img
						alt={fruit.name}
						fetchPriority='high'
						height={imageHeight}
						src={`${fruit.image.url}&w=${imageWidth}&h=${imageHeight}`}
						// biome-ignore lint/nursery/noInlineStyles: dynamic color
						style={{backgroundColor: fruit.image.color}}
						width={imageWidth}
					/>
					<ImageAttribution author={fruit.image.author} />
				</div>
				<div className='my-8 sm:my-0 sm:ml-16'>
					<Link className='flex items-center' to='/'>
						<img alt='' height={20} src='/icons/arrow-left.svg' width={20} />
						<span className='ml-4 text-xl'>Back</span>
					</Link>

					<div className='mt-2 flex flex-wrap items-center gap-3 sm:mt-8'>
						<h1 className='font-bold text-6xl'>{fruit.name}</h1>
						<FavoriteFruitButton
							fruitName={fruit.name}
							isFavorite={isFavorite}
						/>
					</div>
					<h2 className='mt-3 text-gray-500 text-xl dark:text-gray-400'>
						Vitamins per 100 g (3.5 oz)
					</h2>
					<table className='mt-8 text-lg'>
						<thead>
							<tr>
								<th className='px-4 py-2'>Vitamin</th>
								<th className='px-4 py-2'>Amount</th>
							</tr>
						</thead>
						<tbody>
							{fruit.metadata.map(({name, value}) => (
								<tr className='font-medium' key={`FruitVitamin-${name}`}>
									<td className='border border-gray-300 px-4 py-2'>{name}</td>
									<td className='border border-gray-300 px-4 py-2'>{value}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	)
}
