import { GRAMMAR } from '../data/grammar.js';
import { useI18n } from '../i18n.jsx';

export default function Grammar() {
  const { lang, t } = useI18n();
  return (
    <div className="page page-narrow">
      <div className="section-title">
        <h2>{t('grammarTitle')}</h2>
      </div>
      <div className="grammar-grid">
        {GRAMMAR.map((section) => (
          <section key={section.id} className="card grammar-section">
            <h3>{section.title[lang]}</h3>
            <p className="desc">{section.desc[lang]}</p>
            {section.table && (
              <div className="table-scroll">
                <table className="grammar-table">
                  <thead>
                    <tr>
                      {section.table.headers[lang].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, i) => (
                      <tr key={i}>
                        {row[lang].map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {section.examples && (
              <ul className="example-list">
                {section.examples.map((ex) => (
                  <li key={ex.de}>
                    <span className="de">{ex.de}</span>
                    <span className="zh">{ex[lang]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
