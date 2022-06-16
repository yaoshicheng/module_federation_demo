import {
  Form,
  Button,
  Input,
  Popup,
  InfiniteScroll,
  CheckList,
} from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { fetch } from '@xforceplus/standard-http-request';
import { debounce } from 'lodash';

export default function CustomSelector(props) {
  const {
    mode,
    multiple = false,
    onConfirm,
    onCancel,
    placeholder = '请输入',
    fieldLabel,
    fieldName,
    rules,
    searchProps,
    listProps,
  } = props;

  const {
    url,
    method,
    params,
    body,
    pagination = {},
    searchTextName = 'searchText',
  } = searchProps;
  const { label, value, uniqueId } = listProps;
  const {
    pageNoName = 'pageNo',
    pageSizeName = 'pageSize',
    pageNo = 1,
    pageSize = 20,
  } = pagination;

  let { defaultValue  } = props;
  if (!defaultValue || (defaultValue && !Array.isArray(defaultValue))){
    defaultValue = [];
  }

  const [visible, setVisible] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [selected, setSelected] = useState(defaultValue);
  const [selectedValues, setSelectedValues] = useState(
    defaultValue,
  );

  const [lastSelected, setLastSelected] = useState(defaultValue);

  let { data, refetch, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ['search'],
    ({ pageParam = { [pageNoName]: pageNo, [pageSizeName]: pageSize } }) => {
      const req = {
        url,
        method,
      };

      req.params = {
        ...pageParam,
        [searchTextName]: searchName,
        ...params,
      };

      if (body) {
        req.body = { ...body };
      }

      return fetch(req).then((res) => res.data);
    },
    {
      cacheTime: 0,
      keepPreviousData: true,
      getNextPageParam: (lastPage) =>
        lastPage.result.length < +lastPage[pageSizeName]
          ? undefined
          : {
            [pageNoName]: +lastPage[pageNoName] + 1,
            [pageSizeName]: +lastPage[pageSizeName],
          },
      onSuccess(infData) {
        return infData;
      },
    },
  );

  if (mode === "test") {
    let testData = [];
    for (let i = 1; i < 21; i++) {
      testData.push({name: `test data ${i}`, value: `test_data_${i}`});
    }
    data = {
      pages:
        [
          { result: testData}
        ]
    }
  }

  useEffect(() => {
    refetch();
  }, [searchName]);

  const handleClosePopup = () => {
    setVisible(false);
  };

  const handleFocus = () => {
    if (!visible) {
      setVisible(true);
    }
  };

  const handleSearch = debounce((title) => {
    setSearchName(title);
  }, 300);

  const handleClear = () => {
    setSearchName('');
  };

  const handleToggle = (item) => {
    if (multiple) {
      const findIndex = selected.findIndex((s) => s[value] === item[value]);
      const copy = JSON.parse(JSON.stringify(selected));
      const copy2 = JSON.parse(JSON.stringify(selectedValues));

      if (findIndex > -1) {
        copy.splice(findIndex, 1);
        const findIndex2 = selectedValues.findIndex((s) => s === item[value]);
        copy2.splice(findIndex2, 1);
      } else {
        copy.push(item);
        copy2.push(item[value]);
      }
      setSelected(copy);
      setSelectedValues(copy2);
    } else {
      setSelected([item]);
      setSelectedValues([item[value]]);
    }
  };

  const handleDelete = (item) => {
    const findIndex = selected.findIndex((s) => s[value] === item[value]);
    const findIndex2 = selectedValues.findIndex((s) => s === item[value]);
    const copy = JSON.parse(JSON.stringify(selected));
    const copy2 = JSON.parse(JSON.stringify(selectedValues));
    copy.splice(findIndex, 1);
    copy2.splice(findIndex2, 1);
    setSelected(copy);
    setSelectedValues(copy2);
  };

  const handleClearAll = () => {
    setSelected([]);
    setSelectedValues([]);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(selected, fieldName);
    }
    setLastSelected(selected);
    setVisible(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(selected, fieldName);
    }
    setVisible(false);

    if (!Array.isArray(lastSelected)) {
      setLastSelected([]);
    }
    const copy = JSON.parse(JSON.stringify(lastSelected));
    const copy2 = lastSelected.map((s) => s[value]);

    setSelected(copy);
    setSelectedValues(copy2);
  };

  const content = () => (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <div style={{ height: '80px', padding: '0 16px', zIndex: '999' }}>
        <Form.Item label={fieldLabel} name={fieldName} rules={rules}>
          <Input
            placeholder={placeholder}
            onChange={handleSearch}
            clearable
            onClear={handleClear}
          />
        </Form.Item>
      </div>
      <div
        style={{
          maxHeight: '80px',
          padding: '4px 16px',
          overflow: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {selected.map((s) => (
          <div
            key={s[uniqueId]}
            style={{
              fontSize: '14px',
              color: '#333333',
              background: '#f5f5f5',
              height: '37px',
              lineHeight: '37px',
              padding: '0 0 0 8px',
              borderRadius: '2px',
              margin: '0px 10px 5px 0px',
            }}
          >
            {s[label]}
            <Button
              color="primary"
              fill="none"
              onClick={() => {
                handleDelete(s);
              }}
            >
              x
            </Button>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 16px',
          }}
        >
          <Button color="danger" size="small" onClick={handleClearAll}>
            清空
          </Button>
        </div>
      )}
      <div
        style={{
          height: selected.length > 0 ? '65vh' : '77vh',
          overflow: 'auto',
        }}
      >
        <CheckList multiple={multiple} value={selectedValues}>
          {data?.pages.map((page) =>
            page?.result.map((item) => (
              <CheckList.Item
                value={item[value]}
                key={item[uniqueId]}
                onClick={() => handleToggle(item)}
              >
                {item[label]}
              </CheckList.Item>
            )),
          )}
        </CheckList>
        <InfiniteScroll
          loadMore={fetchNextPage}
          hasMore={!!hasNextPage}
        />
      </div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '89vh',
          width: '100%',
        }}
      >
        <Button style={{ width: '50%' }} onClick={handleCancel}>
          取消
        </Button>
        <Button
          color="primary"
          style={{ width: '50%' }}
          onClick={handleConfirm}
        >
          确认
        </Button>
      </div>
    </div>
  );

  const checkedPic = (
    <div
      style={{
        position: 'absolute',
        right: '0',
        bottom: '0',
        width: '0',
        height: '0',
        borderTop: 'solid 8px transparent',
        borderBottom: 'solid 8px #1677ff',
        borderLeft: 'solid 10px transparent',
        borderRight: 'solid 10px #1677ff',
      }}
    >
      <div style={{transform: "translateY(-10px)"}}>
        <svg
          width="8.5px"
          height="6.5px"
          viewBox="0 0 17 13"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g
              transform="translate(-2832.000000, -1103.000000)"
              stroke="#FFFFFF"
              strokeWidth="3"
            >
              <g transform="translate(2610.000000, 955.000000)">
                <g transform="translate(24.000000, 91.000000)">
                  <g transform="translate(179.177408, 36.687816)">
                    <polyline points="34.2767388 22 24.797043 31.4796958 21 27.6826527"></polyline>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );

  return (
    <div>
      <Form.Item label={fieldLabel} name={fieldName} rules={rules}>
        {selected.length > 0 ? (
          <>
            {selected.length > 1 ? (
              <div
                className="selectedClass"
                onClick={handleFocus}
                style={{
                  overflow: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                {selected.map((s) => (
                  <div
                    key={s[uniqueId]}
                    style={{
                      fontSize: '14px',
                      color: '#1677ff',
                      background: '#e7f1ff',
                      height: '22px',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '2px',
                      margin: '0px 10px 5px 0px',
                      position: 'relative',
                    }}
                  >
                    {s[label]}
                    {checkedPic}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="selectedClass"
                onClick={handleFocus}
                style={{ height: '22px', display: 'flex', flexWrap: 'wrap' }}
              >
                {selected.map((s) => (
                  <div
                    key={s[uniqueId]}
                    style={{
                      fontSize: '14px',
                      color: '#1677ff',
                      background: '#e7f1ff',
                      height: '22px',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '2px',
                      margin: '0px 10px 5px 0px',
                      position: 'relative',
                    }}
                  >
                    {s[label]}
                    {checkedPic}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className="initClass"
            onClick={handleFocus}
            style={{
              height: '37px',
              lineHeight: '37px',
              display: 'flex',
              flexWrap: 'wrap',
              fontSize: '14px',
              color: '#aaa',
            }}
          >
            {placeholder}
          </div>
        )}
      </Form.Item>

      <Popup
        visible={visible}
        onMaskClick={handleClosePopup}
        position="top"
        bodyStyle={{
          minHeight: '95vh',
          maxHeight: '95vh',
          marginTop: '5px',
          overflow: 'auto',
        }}
        maskStyle={{ zIndex: '10' }}
      >
        {content()}
      </Popup>
    </div>
  );
}
