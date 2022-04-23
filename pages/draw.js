import React, { useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { CirclePicker } from 'react-color';

const FIRST_COLOR = "#f44336"
const COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3",
  "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39",
  "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"
]

function Pixel({ selectedColor }) {
  const [pixelColor, setPixelColor] = useState("#ffffff00");
  const [oldColor, setOldColor] = useState(pixelColor);
  const [canChangeColor, setCanChangeColor] = useState(true);

  function applyColor() {
    setPixelColor(selectedColor);
    setCanChangeColor(false);
  }

  function changeColorOnHover() {
    setOldColor(pixelColor);
    setPixelColor(selectedColor);
  }

  function resetColor() {
    if (canChangeColor) {
      setPixelColor(oldColor);
    }

    setCanChangeColor(true);
  }

  return (
    <div
      className="w-4 h-4 hover:cursor-pointer"
      onClick={applyColor}
      onMouseEnter={changeColorOnHover}
      onMouseLeave={resetColor}
      style={{ backgroundColor: pixelColor }}
    ></div>
  );
}


function Row(props) {
  const { width, selectedColor } = props;

  let pixels = [];

  for (let i = 0; i < width; i++) {
    pixels.push(<Pixel key={i} selectedColor={selectedColor} />);
  }

  return <div className="flex fit-content">{pixels}</div>;
}

function DrawingPanel({ selectedColor }) {
  const width = 32;
  const height = 32;

  const panelRef = useRef();

  let rows = [];

  for (let i = 0; i < height; i++) {
    rows.push(<Row key={i} width={width} selectedColor={selectedColor} />);
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={panelRef}>
        {rows}
      </div>
    </div>
  );
}


export default function Draw() {
  const [selectedColor, setColor] = useState(FIRST_COLOR);

  function changeColor(color) {
    setColor(color.hex);
  }

  return (
    <div >
      <main className={styles.main}>
        <div className="flex justify-between w-full max-w-2xl">
          <div>

          </div>

          <div className="flex flex-col gap-8 items-center">
            <CirclePicker colors={COLORS} color={selectedColor} onChangeComplete={changeColor} />
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

