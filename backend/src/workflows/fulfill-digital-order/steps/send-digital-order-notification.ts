import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  INotificationModuleService,
  IFileModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { DigitalProductOrder, MediaType } from "../../../modules/digital-product/types"

type SendDigitalOrderNotificationStepInput = {
  digital_product_order: DigitalProductOrder
}

export const sendDigitalOrderNotificationStep = createStep(
  "send-digital-order-notification",
  async ({
    digital_product_order: digitalProductOrder,
  }: SendDigitalOrderNotificationStepInput,
    { container }) => {
    const notificationModuleService: INotificationModuleService = container
      .resolve(Modules.NOTIFICATION)
    const fileModuleService: IFileModuleService = container.resolve(
      Modules.FILE
    )

    const notificationData = await Promise.all(
      digitalProductOrder.products.map(async (product) => {
        const medias = []

        await Promise.all(
          product.medias
            .filter((media) => media.type === MediaType.MAIN)
            .map(async (media) => {
              medias.push(
                (await fileModuleService.retrieveFile(media.fileId)).url as never
              )
            })
        )

        return {
          name: product.name,
          medias,
        }
      })
    )
    // get the client info from the order
    const customer = await container
      .resolve(Modules.CUSTOMER)
      .retrieveCustomer(digitalProductOrder.order?.customer_id ?? "")

    const notification = await notificationModuleService.createNotifications({
      to: digitalProductOrder?.order?.email ?? "",
      template: "d-31a064ac68e1416ea0252d13c400d90a",
      channel: "email",
      content: {
        subject: "M&D - Gracias por tu compra",
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu compra en Mugs&Designs está completa</title>
    <style>
        body {
            font-family: sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1, h2 {
            color: #555;
        }
        .button {
            display: inline-block;
            background-color: #007bff; /* Un color azul estándar */
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .important {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 3px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 0.9em;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>¡Gracias por tu compra en Mugs&Designs!</h1>
        <p>Hola ${customer.first_name?.split(" ")[0] ?? "apreciable cliente"},</p>
        <p>Estamos muy contentos de que hayas elegido nuestros diseños digitales.</p>
        <p>Tu pedido <strong>#${digitalProductOrder.order?.id}</strong> ha sido procesado exitosamente y tus archivos digitales están listos para ser descargados.</p>

        <ul>
          ${notificationData
            .map(
              (product) =>
                `<li>
                      <strong>${product.name}</strong>
                      <ul>
                        ${product.medias
                  .map((media) => `<li><a href="${media}">${media}</a></li>`)
                  .join("")}
                      </ul>
                    </li>`
            )
            .join("")}
        </ul>

        <div class="important">
            <h2>Importante:</h2>
            <ul>
                <li>Por favor, asegúrate de descargar tus archivos y guardarlos en un lugar seguro.</li>
                <li>Si tienes alguna dificultad con la descarga, no dudes en contactarnos respondiendo a este correo.</li>
                <li>Recuerda que estos archivos son para uso personal.</li>
            </ul>
        </div>

        <p>Esperamos que disfrutes de tus nuevos diseños. ¡Nos encantaría ver cómo los utilizas! Si deseas compartir tus creaciones en redes sociales, no dudes en etiquetarnos como @mugs&designs.</p>

        <p>Gracias nuevamente por tu confianza en Mugs&Designs. ¡Esperamos verte pronto!</p>

        <p>Saludos cordiales,</p>
        <p>El equipo de <a href="https://mugsanddesigns.live" style="color: #333; text-decoration: none;">Mugs&Designs</a></p>
    </div>

    <div class="footer">
        <p><a href="[Enlace a la tienda en línea de Mugs&Designs]" style="color: #777; text-decoration: none;">Visita nuestra tienda</a> | ¿Necesitas ayuda? Contáctanos.</p>
    </div>

</body>
</html>
          `,
        text: "",
      },
      data: {
        dynamic_template_data: {
          products: notificationData,
        },
      },
    })

    return new StepResponse(notification)
  }
)
