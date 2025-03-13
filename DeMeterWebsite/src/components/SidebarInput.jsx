import { useState } from "react";
import { motion } from "framer-motion";

export default function SidebarInput() {
  const [isOpen, setIsOpen] = useState(false);

  // State to hold the form inputs
  const [phLow, setPhLow] = useState("");
  const [phHigh, setPhHigh] = useState("");
  const [ecHigh, setEcHigh] = useState("");

  // State for button disable/enable
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // State to track error message visibility
  const [errorMessage, setErrorMessage] = useState("");

  // Function to validate if the value is a valid number (integer or float)
  const isValidNumber = (value) => {
    const number = parseFloat(value);
    return !isNaN(number) && value.trim() !== "";
  };

  // Function to validate all inputs
  const validateInputs = () => {
    if (
      isValidNumber(phLow) &&
      isValidNumber(phHigh) &&
      isValidNumber(ecHigh)
    ) {
      setIsButtonDisabled(false);
      setErrorMessage(""); // Clear the error message if all inputs are valid
    } else {
      setIsButtonDisabled(true);
      setErrorMessage("Please enter valid numbers for all fields."); // Show error message
    }
  };

  // Function to handle form submission (POST request)
  const handleSubmit = async () => {
    if (isButtonDisabled) return;

    const data = {
      low_pH: parseFloat(phLow),
      high_pH: parseFloat(phHigh),
      low_EC: parseFloat(ecHigh),
    };

    try {
      const response = await fetch("/api/set-target-values", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Data successfully sent to the device!");
      } else {
        alert("Failed to send data to the device.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Error sending data to the device.");
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50">
      {/* Toggle button */}
      <button
        className="absolute top-4 left-4 bg-green-400 text-white px-6 py-3 rounded-full z-60 whitespace-nowrap text-lg font-semibold transition-transform duration-300 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Close Panel" : "Open Panel"}
      </button>

      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-80 bg-green-500 text-white p-6 shadow-lg rounded-l-lg"
      >
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Change Target Values</h2>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-lg mb-2">pH Low</label>
              <input
                type="text"
                className="w-full p-3 text-black rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Recommended: 5.5"
                value={phLow}
                onChange={(e) => {
                  setPhLow(e.target.value);
                  validateInputs();
                }}
              />
            </div>

            <div>
              <label className="block text-lg mb-2">pH High</label>
              <input
                type="text"
                className="w-full p-3 text-black rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Recommended: 6.4"
                value={phHigh}
                onChange={(e) => {
                  setPhHigh(e.target.value);
                  validateInputs();
                }}
              />
            </div>

            <div>
              <label className="block text-lg mb-2">
                EC High (max nutrient conc.)
              </label>
              <input
                type="text"
                className="w-full p-3 text-black rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Recommended: 1800"
                value={ecHigh}
                onChange={(e) => {
                  setEcHigh(e.target.value);
                  validateInputs();
                }}
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}

            <button
              className={`${
                isButtonDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-400 cursor-pointer"
              } text-white px-6 py-3 rounded-full z-60 whitespace-nowrap text-lg font-semibold transition-transform duration-300 hover:scale-105`}
              onClick={handleSubmit}
              disabled={isButtonDisabled}
            >
              Send to Device
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// import { useState } from "react";
// import { motion } from "framer-motion";

// export default function SidebarInput() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="fixed top-0 left-0 z-50">
//       {/* Toggle button */}
//       <button
//         className="absolute top-4 left-4 bg-green-400 text-white px-6 py-3 rounded-full z-60 whitespace-nowrap text-lg font-semibold transition-transform duration-300 hover:scale-105"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {isOpen ? "Close Panel" : "Open Panel"}
//       </button>

//       <motion.div
//         initial={{ x: "-100%" }}
//         animate={{ x: isOpen ? 0 : "-100%" }}
//         transition={{ duration: 0.3 }}
//         className="fixed top-0 left-0 h-full w-80 bg-green-500 text-white p-6 shadow-lg rounded-l-lg"
//       >
//         <div className="mt-16">
//           <h2 className="text-2xl font-bold mb-6">Change Target Values</h2>

//           {/* Form Inputs */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-lg mb-2">pH Low</label>
//               <input
//                 className="w-full p-3 text-black rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 placeholder="Recommended: 5.5"
//               />
//             </div>

//             <div>
//               <label className="block text-lg mb-2">pH High</label>
//               <input
//                 className="w-full p-3 text-black rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 placeholder="Recommended: 6.4"
//               />
//             </div>

//             <div>
//               <label className="block text-lg mb-2">
//                 EC High (max nutrient conc.)
//               </label>
//               <input
//                 className="w-full p-3 text-black rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 placeholder="Recommended: 1800"
//               />
//             </div>
//             <button className="bg-green-400 text-white px-6 py-3 rounded-full z-60 whitespace-nowrap text-lg font-semibold transition-transform duration-300 hover:scale-105">
//               Send to Device
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }
