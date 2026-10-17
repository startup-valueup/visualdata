import {byId} from "./chart.js";

// 알약형 탭: container 안에 .tab 버튼을 만들고, 클릭하면 active 를 옮기고 onSelect(value) 호출.
// 첫 항목을 선택한 상태로 onSelect 를 한 번 호출한다.
export function mountTabs(containerId, values, onSelect) {
  const container = byId(containerId);
  container.replaceChildren(
    ...values.map((value, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = i === 0 ? "tab active" : "tab";
      button.dataset.value = value;
      button.textContent = value;
      button.addEventListener("click", () => {
        for (const tab of container.querySelectorAll(".tab")) tab.classList.remove("active");
        button.classList.add("active");
        onSelect(value);
      });
      return button;
    })
  );
  onSelect(values[0]);
}
