export const CardInput = (props) => {
  return (
    <>
      <div> Card  </div>
      <button onClick={() => {
        props.onSubmit({ label: "Submitted", value: JSON.stringify({ "vcdphidsm5nqdeiarvl11dj5g": "Dropdown1", "vj7dviiwtnnday3u8codhdzgc": "checkbox1" }) })
      }} > Submit  </button>

    </>
  )
}