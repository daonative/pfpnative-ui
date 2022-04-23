import React, { useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { CirclePicker } from 'react-color';
import _ from 'lodash';


const FIRST_COLOR = "#f44336"
const COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3",
  "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39",
  "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"
]

function DrawingPanel({ selectedColor }) {
  const [pixelColors, setPixelColors] = useState()

  const width = 32;
  const height = 32;

  const rows = [...Array(height).keys()]
  const cols = [...Array(width).keys()]

  const setColor = (rowId, colId, color) => {
    setPixelColors(prevState => _.merge({}, prevState, { [rowId]: { [colId]: { color } } }))
  }

  const handleHover = (rowId, colId, color) => {
    setPixelColors(prevState => _.merge({}, prevState, { [rowId]: { [colId]: { hoverColor: color } } }))
  }

  const handleHoverExit = (rowId, colId) => {
    setPixelColors(prevState => _.merge({}, prevState, { [rowId]: { [colId]: { hoverColor: null } } }))
  }

  return (
    <div className="flex flex-col items-center">
      <div>
        {rows.map(rowId => (
          <div key={`row-${rowId}`} className="flex fit-content">
            {cols.map(colId => {
              const pixel = pixelColors?.[rowId]?.[colId] || {}
              const color = pixel.hoverColor || pixel.color || null
              const style = color ? {backgroundColor: color} : {}
              return (
                <div
                  key={`pixel-${rowId}-${colId}`}
                  className="w-4 h-4 hover:cursor-pointer"
                  onClick={() => setColor(rowId, colId, selectedColor)}
                  onMouseEnter={() => handleHover(rowId, colId, selectedColor)}
                  onMouseLeave={() => handleHoverExit(rowId, colId)}
                  style={style}
                />
              )
            })}
          </div>
          ))}
      </div>
    </div>
  );
}


export default function Draw() {
  const [selectedColor, setColor] = useState(FIRST_COLOR);

  const changeColor = (color) => setColor(color.hex)
  const handleEraser = () => setColor(null)

  return (
    <div >
      <main className={styles.main}>
        <div className="flex justify-between w-full max-w-2xl">
          <div>

          </div>
          <div className="flex flex-col gap-8 items-center">
            <CirclePicker colors={COLORS} color={selectedColor || "#ffffff00"} onChangeComplete={changeColor} />
            <button onClick={handleEraser}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <DrawingPanel selectedColor={selectedColor} />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

