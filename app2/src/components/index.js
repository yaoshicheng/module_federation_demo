import React from "react";
import { QueryClient, QueryClientProvider } from 'react-query';
import CustomSelector from "./test";
const queryClient = new QueryClient()

const Demo = (props) => {
  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <CustomSelector {...props} />
    </QueryClientProvider>
  )
}
export default Demo

