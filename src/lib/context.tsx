"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import {
  AppState,
  DateRange,
  YearScoreData,
  DailyForecast,
  CampsiteAvailability,
  ParkAlert,
} from "./types";
import { PARK_ZONES } from "./constants";

type Action =
  | { type: "SET_RANGE"; payload: DateRange | null }
  | { type: "SET_YEAR_SCORES"; payload: YearScoreData }
  | { type: "SET_RANGE_WEATHER"; payload: DailyForecast[] }
  | { type: "SET_RANGE_CAMPSITES"; payload: CampsiteAvailability[] }
  | { type: "SET_YEAR"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ALERTS"; payload: ParkAlert[] };

const initialState: AppState = {
  selectedRange: null,
  zones: PARK_ZONES,
  yearScores: null,
  rangeWeather: [],
  rangeCampsites: [],
  alerts: [],
  isLoading: false,
  error: null,
  currentYear: new Date().getFullYear(),
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_RANGE":
      return {
        ...state,
        selectedRange: action.payload,
        rangeWeather: [],
        rangeCampsites: [],
      };
    case "SET_YEAR_SCORES":
      return { ...state, yearScores: action.payload };
    case "SET_RANGE_WEATHER":
      return { ...state, rangeWeather: action.payload };
    case "SET_RANGE_CAMPSITES":
      return { ...state, rangeCampsites: action.payload };
    case "SET_YEAR":
      return {
        ...state,
        currentYear: action.payload,
        yearScores: null,
        selectedRange: null,
        rangeWeather: [],
        rangeCampsites: [],
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_ALERTS":
      return { ...state, alerts: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  setRange: (range: DateRange | null) => void;
  setYearScores: (scores: YearScoreData) => void;
  setRangeWeather: (weather: DailyForecast[]) => void;
  setRangeCampsites: (campsites: CampsiteAvailability[]) => void;
  setYear: (year: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAlerts: (alerts: ParkAlert[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setRange = useCallback((range: DateRange | null) => {
    dispatch({ type: "SET_RANGE", payload: range });
  }, []);

  const setYearScores = useCallback((scores: YearScoreData) => {
    dispatch({ type: "SET_YEAR_SCORES", payload: scores });
  }, []);

  const setRangeWeather = useCallback((weather: DailyForecast[]) => {
    dispatch({ type: "SET_RANGE_WEATHER", payload: weather });
  }, []);

  const setRangeCampsites = useCallback((campsites: CampsiteAvailability[]) => {
    dispatch({ type: "SET_RANGE_CAMPSITES", payload: campsites });
  }, []);

  const setYear = useCallback((year: number) => {
    dispatch({ type: "SET_YEAR", payload: year });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const setAlerts = useCallback((alerts: ParkAlert[]) => {
    dispatch({ type: "SET_ALERTS", payload: alerts });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        setRange,
        setYearScores,
        setRangeWeather,
        setRangeCampsites,
        setYear,
        setLoading,
        setError,
        setAlerts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
