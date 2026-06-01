
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Публичная оферта | Bonds-Lab",
    description: "Договор на оказание информационных услуг с использованием сервиса Bonds-Lab.",
};

export default function OfferPage() {
    return (
        <div className="relative overflow-hidden bg-background min-h-screen">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl relative z-10">

                
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-card border border-slate-200/60 relative overflow-hidden text-left">

                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground tracking-tight leading-tight">
                        ПУБЛИЧНАЯ ОФЕРТА<br />
                        о заключении договора на оказание информационных услуг
                    </h1>

                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-50 text-muted-foreground text-sm font-medium mb-10 border border-slate-100 shadow-sm">
                        Дата публикации: 21 февраля 2026 г.
                    </div>

                    <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold">

                        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">1. Общие положения</h3>
                        <p>
                            1.1. Настоящий документ является официальным предложением (публичной офертой) физического лица <strong>{process.env.NEXT_PUBLIC_LEGAL_FIO}</strong>, применяющего специальный налоговый режим «Налог на профессиональный доход» (далее — <strong>Исполнитель</strong>), заключить договор на оказание информационных услуг с любым физическим лицом (далее — <strong>Заказчик</strong>) на условиях, изложенных ниже.
                        </p>
                        <p>
                            1.2. В соответствии с пунктом 2 статьи 437 Гражданского кодекса Российской Федерации (ГК РФ) данный документ признается публичной офертой. Акцептом (полным и безоговорочным принятием) условий настоящей Оферты считается совершение Заказчиком действий по регистрации на Сайте и оплате Услуг.
                        </p>
                        <p>
                            1.3. Совершая оплату, Заказчик подтверждает, что он ознакомлен с условиями Оферты, понимает их и согласен с ними в полном объеме.
                        </p>

                        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">2. Предмет Договора</h3>
                        <p>
                            2.1. Исполнитель обязуется предоставить Заказчику доступ к функционалу информационно-аналитического сервиса <strong>«Bonds-Lab»</strong> (далее — Сервис), расположенного по адресу https://bonds-lab.ru, а Заказчик обязуется оплатить этот доступ.
                        </p>
                        <p>2.2. Функционал Сервиса включает в себя:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li>Инструменты для поиска и фильтрации (скрининга) облигаций по заданным параметрам;</li>
                            <li>Предоставление подробной информации и метрик по выбранным облигациям;</li>
                            <li>Возможность экспорта результатов в буфер обмена для их дальнейшего использования (в том числе для контент-мейкеров).</li>
                        </ul>

                        <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-2xl my-8 shadow-sm borderless">
                            <p className="font-bold text-rose-900 mb-2">ВАЖНО: Отказ от ответственности</p>
                            <p className="text-rose-800 text-base">
                                2.3. Информация, предоставляемая Сервисом, <strong>не является индивидуальной инвестиционной рекомендацией</strong>, призывом к действию или финансовой консультацией.
                            </p>
                            <p className="text-rose-800 text-base mt-2">
                                Сервис является информационным инструментом (справочником). Исполнитель не несет ответственности за инвестиционные решения Заказчика, принятые на основе данных Сервиса, а также за возможные финансовые убытки.
                            </p>
                        </div>

                        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">3. Стоимость услуг и порядок расчетов</h3>
                        <p>3.1. Услуги предоставляются на условиях разовой предоплаты. Оплата производится посредством банковской карты через платежный сервис <strong>ЮKassa</strong>.</p>

                        <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 my-8 shadow-sm borderless">
                            <h4 className="text-xl font-bold text-foreground mb-4">Тарифы платформы:</h4>

                            <p className="mb-6 text-sm md:text-base text-muted-foreground">При оплате банковской картой активируется автоматическое продление подписки (рекуррентные платежи), которое Заказчик может отключить в любой момент в личном кабинете.</p>

                            <ul className="list-none space-y-3 text-foreground">
                                <li className="flex justify-between items-center border-b border-slate-200 pb-3">
                                    <span><strong>1 месяц</strong> доступа:</span>
                                    <span className="font-semibold text-lg">299 ₽</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-slate-200 pb-3">
                                    <span><strong>3 месяца</strong> доступа:</span>
                                    <span className="font-semibold text-lg">790 ₽</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-slate-200 pb-3">
                                    <span><strong>6 месяцев</strong> доступа:</span>
                                    <span className="font-semibold text-lg">1490 ₽</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-slate-200 pb-3">
                                    <span><strong>1 год</strong> доступа (Хит):</span>
                                    <span className="font-semibold text-lg">2490 ₽</span>
                                </li>
                                <li className="flex justify-between items-center pt-3 text-primary font-bold">
                                    <span>Вечный доступ (Навсегда):</span>
                                    <span className="text-xl">4990 ₽</span>
                                </li>
                            </ul>
                        </div>

                        <p>3.2. <strong>Автоматическое продление:</strong> При оплате услуг банковской картой Заказчик соглашается на сохранение данных карты платежным сервисом и автоматическое списание средств за следующий период (автопродление). Автопродление можно в любой момент отключить в личном кабинете в разделе управления подпиской.</p>
                        <p>3.3. <strong>Продление доступа:</strong> По истечении оплаченного периода, если автопродление отключено, доступ к закрытому функционалу Сервиса приостанавливается до совершения нового платежа.</p>

                        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">4. Порядок сдачи-приемки услуг и возврат средств</h3>
                        <p>4.1. Услуга считается оказанной Исполнителем надлежащим образом и принятой Заказчиком в полном объеме в момент предоставления Заказчику технического доступа к закрытой части Сервиса (активации оплаченного тарифа).</p>

                        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl my-8 shadow-sm borderless">
                            <p className="font-bold text-amber-900 mb-2">4.2. Политика отсутствия возвратов:</p>
                            <p className="text-amber-800 text-base">
                                В силу характера предоставляемой Услуги (открытие немедленного доступа к закрытой информации и аналитическим инструментам), а также ввиду того, что все платежи являются добровольными — <strong>возврат денежных средств за оплаченный период не производится ни при каких обстоятельствах.</strong>
                            </p>
                            <p className="text-amber-800 text-base mt-2">
                                Это условие действует в том числе, если Заказчик передумал, ошибся в выборе тарифа или не воспользовался доступом по собственной инициативе после оплаты.
                            </p>
                        </div>

                        <p>4.3. В исключительных случаях технических сбоев на стороне платежной системы ЮKassa (например, подтвержденное двойное списание средств за один и тот же заказ в одну и ту же минуту), Исполнитель обязуется вернуть излишне уплаченные средства. Для этого Заказчик должен направить запрос на адрес электронной почты: <a href={`mailto:${process.env.NEXT_PUBLIC_LEGAL_EMAIL}`} className="text-primary hover:text-primary-hover hover:underline transition-colors font-medium borderless">{process.env.NEXT_PUBLIC_LEGAL_EMAIL}</a>.</p>

                        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">5. Права и обязанности сторон</h3>
                        <p>5.1. <strong>Исполнитель обязуется:</strong></p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li>Обеспечивать круглосуточную работу Сервиса (за исключением перерывов на техническое обслуживание);</li>
                            <li>Обеспечивать конфиденциальность данных Заказчика.</li>
                        </ul>
                        <p className="mt-6">5.2. <strong>Заказчик обязуется:</strong></p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li>Указывать достоверные данные при регистрации;</li>
                            <li>Самостоятельно следить за сроком окончания тарифа и производить оплату для продления доступа, если желает продолжить использование Сервиса;</li>
                            <li>Не передавать доступ к своему аккаунту третьим лицам. Допускается использование экспортированных данных (буфер обмена) в личных целях и для создания авторского контента.</li>
                        </ul>

                        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">6. Ответственность</h3>
                        <p>6.1. Исполнитель не гарантирует стопроцентную точность, полноту и актуальность финансовых данных по облигациям, полученных из внешних источников (данные бирж, эмитентов), хотя и прилагает все усилия для обеспечения их достоверности.</p>
                        <p>6.2. Исполнитель не несет ответственности за любые прямые или косвенные убытки Заказчика, возникшие в результате использования Сервиса, включая упущенную выгоду от сделок на бирже.</p>
                        <p>6.3. Сервис предоставляется на условиях «как есть». Несоответствие функционала субъективным ожиданиям Заказчика не является основанием для возврата средств.</p>

                        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">7. Персональные данные</h3>
                        <p>7.1. Акцептуя Оферту, Заказчик дает согласие на обработку своих персональных данных в соответствии с Политикой конфиденциальности, размещенной на Сайте.</p>
                        <p>7.2. Исполнитель не собирает и не хранит платежные данные (номер карты, CVC). Вся обработка платежей осуществляется на стороне защищенного процессингового центра <strong>ЮKassa</strong>.</p>

                        <h3 className="text-2xl font-bold text-foreground mt-12 mb-6">8. Реквизиты Исполнителя</h3>
                        <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-base">
                            <p className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200 pb-3">
                                <span className="text-muted-foreground mb-1 sm:mb-0">Исполнитель:</span>
                                <span className="font-semibold text-foreground sm:text-right">Самозанятый {process.env.NEXT_PUBLIC_LEGAL_FIO}</span>
                            </p>
                            <p className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200 pb-3">
                                <span className="text-muted-foreground mb-1 sm:mb-0">ИНН:</span>
                                <span className="font-mono text-foreground font-medium sm:text-right">{process.env.NEXT_PUBLIC_LEGAL_INN}</span>
                            </p>
                            <p className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200 pb-3 borderless">
                                <span className="text-muted-foreground mb-1 sm:mb-0">Телефон:</span>
                                <a href="tel:+79124647173" className="text-primary hover:text-primary-hover transition-colors font-medium sm:text-right borderless">+7 912 464-71-73</a>
                            </p>
                            <p className="flex flex-col sm:flex-row sm:justify-between borderless">
                                <span className="text-muted-foreground mb-1 sm:mb-0">Электронная почта:</span>
                                <a href={`mailto:${process.env.NEXT_PUBLIC_LEGAL_EMAIL}`} className="text-primary hover:text-primary-hover transition-colors font-medium sm:text-right borderless">{process.env.NEXT_PUBLIC_LEGAL_EMAIL}</a>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}