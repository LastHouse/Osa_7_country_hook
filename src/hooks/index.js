import { useState, useEffect, useReducer } from 'react';

export const useField = (type) => {
  const [value, setValue] = useState('');

  const onChange = (event) => {
    setValue(event.target.value);
  };

  return {
    type,
    value,
    onChange,
  };
};

export const useCountry = (name) => {
  const url = `https://restcountries.eu/rest/v2/name/${name}`;

  const initialState = {
    status: 'idle',
    error: null,
    found: false,
    data: '',
  };

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'FETCHING':
        return { ...initialState, status: 'fetching' };
      case 'FETCHED':
        return {
          ...initialState,
          status: 'fetched',
          found: true,
          data: action.payload[0],
        };
      case 'FETCH_ERROR':
        return { ...initialState, status: 'error', error: action.payload };
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    let cancelRequest = false;
    if (!name) return;
    if (!url) return;

    const fetchData = async () => {
      dispatch({ type: 'FETCHING' });
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (cancelRequest) return;
        if (data.status === 404) return;
        dispatch({ type: 'FETCHED', payload: data });
      } catch (error) {
        if (cancelRequest) return;
        dispatch({ type: 'FETCH_ERROR', payload: error.message });
      }
    };

    fetchData();

    return function cleanup() {
      cancelRequest = true;
    };
  }, [name, url]);

  return state;
};
