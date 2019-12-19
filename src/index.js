import "core-js/stable"
import "regenerator-runtime/runtime"

import "index.sass"
import { html, render } from "lit-html"
import config from "config.yaml"

const template = (attackers, numbers, options, defenders, link) =>
  html`
    <div class="attacker">
      <span class="title">attacker</span>
      <select id="attacker">
        <option value="none">none</option>
        ${attackers.map(
          i =>
            html`
              <option value="${i}">${i}</option>
            `,
        )}
      </select>
      ${numbers.length
        ? html`
            <span>×</span>
            <select id="number">
              ${numbers.map(
                i =>
                  html`
                    <option value="${i}">${i}</option>
                  `,
              )}
            </select>
          `
        : html``}
    </div>
    <div class="defender">
      <span class="title">defender</span>
      <select id="defender">
        <option value="none">none</option>
        ${defenders.map(
          i =>
            html`
              <option value="${i}">${i}</option>
            `,
        )}
      </select>
    </div>
    ${options.map(
      i =>
        html`
          <label>
            <input type="checkbox" name="${i}" />
            <span>${i}</span>
          </label>
        `,
    )}

    <a href="http://40k.ghostlords.com/dice/#${link}" target="_blank"
      >calculate</a
    >
  `

class QuickRoller {
  constructor() {
    this.render()
    document.addEventListener("change", () => this.render())
  }

  render() {
    const selection = {
      attacker: QuickRoller.getSelectedOption("attacker"),
      defender: QuickRoller.getSelectedOption("defender"),
      number: QuickRoller.getSelectedOption("number"),
      options: QuickRoller.getSelectedModifiers(),
    }

    let attacker
    let defender

    const attackers = config.attackers.map(i => i.name).sort()
    const defenders = config.defenders.map(i => i.name).sort()
    let numbers = []
    let options = []

    if (selection.attacker !== "none") {
      attacker = config.attackers.find(i => i.name === selection.attacker)
      ;(attacker.modifiers || []).sort().forEach(i => options.push(i))
      attacker.number.forEach(i => numbers.push(i))
    }

    if (selection.defender !== "none") {
      defender = config.defenders.find(i => i.name === selection.defender)
      ;(defender.modifiers || []).sort().forEach(i => options.push(i))
    }

    const link = QuickRoller.createLink(
      attacker,
      selection.number,
      defender,
      selection.options,
    )
    render(
      template(attackers, numbers, options, defenders, link),
      document.body,
    )
  }

  static createLink(attacker, number = 1, defender, options) {
    if (!attacker || !defender) {
      return ""
    }

    const x = Object.assign({}, attacker, defender)

    options = options.map(i => config.modifiers.find(o => o.name === i))

    options.forEach(option => {
      for (let key in option) {
        const type = typeof option[key]
        if (type === "string") {
          x[key] = option[key]
        }
        if (type === "number") {
          x[key] += option[key]
        }
      }
    })

    x.attacks = Number(x.attacks) * Number(number)

    return Object.entries(x)
      .filter(pair => pair[0] !== "name")
      .filter(pair => pair[0] !== "modifiers")
      .filter(pair => pair[0] !== "number")
      .filter(pair => Boolean(pair[1]))
      .map(pair => pair.join("="))
      .join("&")
  }

  static getSelectedModifiers() {
    return Array.from(document.querySelectorAll("input"))
      .filter(i => i.checked)
      .map(i => i.name)
  }

  static getSelectedOption(dropdown) {
    const el = document.getElementById(dropdown)
    if (!el) {
      return "none"
    }

    return el.options[el.selectedIndex].value
  }
}
new QuickRoller()
