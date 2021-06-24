import React from 'react'
import type { AppProps } from 'next/app'
import { ApolloClient, ApolloProvider, NormalizedCache } from '@apollo/client'
import { globalStyle } from '~/styles/global-styles'
import { wrapper } from '~/redux/store'
import { useApollo } from '~/apollo/use-apollo'
import { INIT_STATE, SERVER_ACCESS_TOKEN } from '~/apollo/constants'
import { LayersManager } from '~/components/base/layer/layers-manager'

type MyAppProps = AppProps & {
	apolloClient: ApolloClient<NormalizedCache>
}

function MyApp({ Component, pageProps }: MyAppProps) {
	const client = useApollo(
		pageProps[INIT_STATE],
		pageProps[SERVER_ACCESS_TOKEN]
	)

	return (
		<>
			{globalStyle}
			<ApolloProvider client={client}>
				<LayersManager>
					<Component {...pageProps} />
				</LayersManager>
			</ApolloProvider>
		</>
	)
}

export default wrapper.withRedux(MyApp)
