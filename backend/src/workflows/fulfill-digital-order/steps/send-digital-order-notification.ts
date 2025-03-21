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

    const notification = await notificationModuleService.createNotifications({
      to: digitalProductOrder?.order?.email ?? "",
      template: "d-31a064ac68e1416ea0252d13c400d90a",
      channel: "email",
      content: {
        subject: "Your digital order is ready",
        html: `
          <p>Your digital order is ready for download. You can download your products by clicking the links below.</p>
          <ul>
            ${notificationData
            .map(
              (product) =>
                `<li><strong>${product.name}</strong>: ${product.medias
                  .map((media) => `<a href="${media}">${media}</a>`)
                  .join(", ")}</li>`
            )
            .join("")}
          </ul>
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
