/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [ws, setWs] = useState(null);
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000");
    socket.onopen = () => {
      console.log("WebSocket connection established");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === "clear") {
        clearCanvas();
      } else if (data.action === "draw") {
        const { offsetX, offsetY } = data;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
      } else if (data.action === "preventloop") {
        const { offsetX, offsetY, color } = data;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setColor(color);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    contextRef.current = ctx;
  }, []);

  useEffect(() => {
    contextRef.current.lineCap = "round";
    contextRef.current.strokeStyle = color || "black";
    contextRef.current.lineWidth = 5;
  }, [color]);

  const startDrawing = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setDrawing(true);
    event.preventDefault();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({ action: "preventloop", offsetX, offsetY, color })
      );
    }
  };

  const handleDrawing = (event) => {
    if (!drawing) return;
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "draw", offsetX, offsetY }));
    }
  };

  const endDrawing = () => {
    contextRef.current.closePath();
    setDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    clearCanvas();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "clear" }));
    }
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={handleDrawing}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        style={{ border: "2px solid black" }}
      ></canvas>
      <button onClick={handleClear}>Clear</button>
      <form>
        <label htmlFor="colorPicker">Color:</label>
        <input
          id="colorPicker"
          type="color"
          value={color}
          onChange={handleColorChange}
        />
      </form>
    </div>
  );
};

export default Canvas;
