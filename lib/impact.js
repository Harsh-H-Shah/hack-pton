export function calculateEquivalencies(totalCo2Kg) {
  return {
    treesPlanted:  +(totalCo2Kg / 22).toFixed(1),      // 22 kg CO₂/year per tree
    carMilesSaved: +(totalCo2Kg / 0.404).toFixed(0),   // 0.404 kg CO₂/mile
    phoneCharges:  +(totalCo2Kg / 0.008).toFixed(0),   // 0.008 kg CO₂/charge
    flightsOffset: +(totalCo2Kg / 250).toFixed(2),     // 250 kg CO₂/domestic flight
  };
}
