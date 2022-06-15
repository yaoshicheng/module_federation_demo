import React, {Suspense} from "react";
const RemoteApp = React.lazy(() => import("app2/App"));

const App = () => {
  return (
    <div>
      <div style={{
        margin:"10px",
        padding:"10px",
        textAlign:"center",
        backgroundColor:"greenyellow"
      }}>
        <h1>App1</h1>
      </div>
      <Suspense fallback={"loading..."}>
      <RemoteApp
          multiple
          mode="test"
          defaultValue={[]}
          searchProps={{
            url: '/api/downloadcenter/v1/user/queryUserByPage',
            method: 'GET',
            searchTextName: 'userNameLike',
            pagination: {
              pageNoName: 'pageNo',
              pageSizeName: 'pageCount',
            },
          }}
          listProps={{
            label: 'name',
            uniqueId: 'value',
            value: 'value',
          }}
          fieldLabel="租户"
          fieldName="userNameLike"
          placeholder="请输入租户名称"
        />
      </Suspense>
    </div>)
}


export default App;
